'use client';

import React, { useEffect } from 'react';
import AdminPortal from '@/components/Admin/AdminPortal';
import { useLogistics } from '@/context/LogisticsContext';
import Link from 'next/link';
import { ArrowLeft, Database, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const { setRole } = useLogistics();

  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>SwifLoad Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Centralized Cloud Sync Active
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Database: Synced (Azure Cloud)</span>
          </div>
          <Link
            href="/downloads"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Mobile Apps Download
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <AdminPortal />
      </main>
    </div>
  );
}
