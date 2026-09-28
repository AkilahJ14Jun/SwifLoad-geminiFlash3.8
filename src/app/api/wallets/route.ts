import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server/db';
import { broadcastEvent } from '@/lib/server/events';
import { WalletTransaction } from '@/types/logistics';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { entityType, id, amount, description, category, type } = body;
    const db = getDatabase();

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type: type || (amount >= 0 ? 'CREDIT' : 'DEBIT'),
      amount: Math.abs(amount),
      balanceAfter: 0,
      description: description || 'Wallet adjustment',
      category: category || (amount >= 0 ? 'TOPUP' : 'COMMISSION_DEDUCTION'),
    };

    if (entityType === 'customer') {
      const oldBal = db.customer.wallet?.balance || 0;
      const newBal = oldBal + amount;
      tx.balanceAfter = newBal;
      db.customer.wallet = {
        balance: newBal,
        transactions: [tx, ...(db.customer.wallet?.transactions || [])],
      };
      saveDatabase(db);
      broadcastEvent('WALLET_UPDATED', { entityType: 'customer', id, wallet: db.customer.wallet });
      return NextResponse.json({ success: true, wallet: db.customer.wallet });
    }

    if (entityType === 'driver') {
      const driverIndex = db.drivers.findIndex((d) => d.id === id);
      if (driverIndex === -1) {
        return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
      }

      const driver = db.drivers[driverIndex];
      const oldBal = driver.wallet?.balance || 0;
      const newBal = oldBal + amount;
      tx.balanceAfter = newBal;
      driver.wallet = {
        balance: newBal,
        negativeBalanceLimit: body.negativeLimit !== undefined ? body.negativeLimit : (driver.wallet?.negativeBalanceLimit || 1500),
        todayEarnings: driver.wallet?.todayEarnings || 0,
        pendingPayout: driver.wallet?.pendingPayout || 0,
        transactions: [tx, ...(driver.wallet?.transactions || [])],
      };

      db.drivers[driverIndex] = driver;
      saveDatabase(db);
      broadcastEvent('WALLET_UPDATED', { entityType: 'driver', id, walletBalance: newBal, driver });
      return NextResponse.json({ success: true, driver });
    }

    return NextResponse.json({ success: false, error: 'Invalid entityType' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
