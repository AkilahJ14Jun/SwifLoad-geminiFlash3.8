import os
import time
from playwright.sync_api import sync_playwright

output_dir = os.path.join(os.getcwd(), 'public', 'downloads', 'real_app_screenshots')
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(
        viewport={'width': 412, 'height': 915},
        device_scale_factor=2,
        user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36'
    )
    page = context.new_page()

    # 1. Customer Booking Screen (Tata Ace, Distance Slabs, GPay)
    print("1. Capturing Customer Booking (Step 1)...")
    page.goto('https://swifload-cbe.azurewebsites.net/customer', wait_until='networkidle')
    page.wait_for_timeout(2500)
    page.screenshot(path=os.path.join(output_dir, 'step1_customer_booking.png'))

    # 2. Driver Dispatch Screen (Suresh Kumar, Dispatch alert, Tata Ace)
    print("2. Capturing Driver Cockpit & Dispatch Alert (Step 2)...")
    page.goto('https://swifload-cbe.azurewebsites.net/driver', wait_until='networkidle')
    page.wait_for_timeout(2500)
    page.screenshot(path=os.path.join(output_dir, 'step2_driver_dispatch.png'))

    # 3. Customer Live GPS Radar Tracking Map (Step 3)
    print("3. Capturing Customer Live Tracking Map (Step 3)...")
    page.goto('https://swifload-cbe.azurewebsites.net/customer', wait_until='networkidle')
    page.wait_for_timeout(1500)
    # Click bottom nav 'Active' button for tracking
    active_btn = page.locator('button:has-text("Active")').first
    if active_btn.count() > 0:
        active_btn.click()
        page.wait_for_timeout(3500) # Wait for Leaflet map tiles
    page.screenshot(path=os.path.join(output_dir, 'step3_customer_tracking.png'))

    # 4. Driver In-Transit & 2-Step OTP / POD Handover Screen (Step 4)
    print("4. Capturing Driver Delivery & OTP Handover (Step 4)...")
    page.goto('https://swifload-cbe.azurewebsites.net/driver', wait_until='networkidle')
    page.wait_for_timeout(2500)
    # Scroll slightly to show active trip / OTP delivery details
    page.evaluate("window.scrollBy(0, 200)")
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(output_dir, 'step4_driver_delivery_pod.png'))

    # 5. Driver Earnings & Wallet Settlement (Step 5)
    print("5. Capturing Driver Wallet & Earnings Ledger (Step 5)...")
    # Click 'Wallet' in driver bottom nav
    wallet_btn = page.locator('button:has-text("Wallet")').first
    if wallet_btn.count() > 0:
        wallet_btn.click()
        page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(output_dir, 'step5_driver_wallet.png'))

    browser.close()

print("\n--- All 5 Workflow Screenshots Captured Successfully ---")
for f in sorted(os.listdir(output_dir)):
    p = os.path.join(output_dir, f)
    print(f"{f} -> {os.path.getsize(p)} bytes")
