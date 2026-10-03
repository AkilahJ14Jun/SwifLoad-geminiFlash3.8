import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    font_names = ['segoeuib.ttf' if bold else 'segoeui.ttf', 'arialbd.ttf' if bold else 'arial.ttf', 'impact.ttf', 'tahomabd.ttf']
    for f in font_names:
        p = os.path.join(r'C:\Windows\Fonts', f)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def create_video():
    W, H = 720, 1280
    FPS = 30
    DURATION_SEC = 10
    TOTAL_FRAMES = FPS * DURATION_SEC # 300 frames
    
    poster_path = os.path.join(os.getcwd(), 'public', 'downloads', 'swifload-promo-poster.jpg')
    poster_img = None
    if os.path.exists(poster_path):
        poster_img = Image.open(poster_path).convert('RGB')
        poster_img = poster_img.resize((W, H), Image.Resampling.LANCZOS)
    
    # Fonts
    f_badge = get_font(20, bold=True)
    f_hero = get_font(46, bold=True)
    f_title = get_font(34, bold=True)
    f_subtitle = get_font(22, bold=False)
    f_card_title = get_font(24, bold=True)
    f_card_sub = get_font(18, bold=False)
    f_cta = get_font(30, bold=True)
    f_url = get_font(22, bold=True)
    f_small = get_font(16, bold=False)
    
    output_path = os.path.join(os.getcwd(), 'public', 'downloads', 'SwifLoad-Promo-Reel.mp4')
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, float(FPS), (W, H))
    
    print(f"Generating 10-second promotional Instagram video ({TOTAL_FRAMES} frames)...")
    
    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / FPS # time in seconds (0.0 to 10.0)
        progress = frame_idx / float(TOTAL_FRAMES)
        
        # Base canvas: Dark slate / obsidian gradient
        # Pre-generate gradient background
        bg = Image.new('RGB', (W, H), (10, 15, 26))
        draw = ImageDraw.Draw(bg)
        
        # Dynamic subtle animated gradient glow in background
        glow_y = int(300 + 100 * np.sin(t * 1.5))
        glow_radius = 280
        # Draw radial glow
        draw.ellipse([W//2 - glow_radius, glow_y - glow_radius, W//2 + glow_radius, glow_y + glow_radius], fill=(12, 38, 35))
        
        # =========================================================================
        # SCENE 1: 0.0s to 2.5s (Frames 0 to 75) - Hook & Coimbatore City Announcement
        # =========================================================================
        if t < 2.5:
            s_prog = min(1.0, t / 0.8) # entry speed
            alpha_slide = int((1.0 - np.exp(-s_prog * 4)) * 100) # fast ease-out
            
            # Top location pill
            draw_rounded_rect(draw, [W//2 - 190, 70, W//2 + 190, 115], 22, fill=(16, 32, 28), outline=(16, 185, 129), width=2)
            # Pulsing green dot
            dot_r = 6 + int(2 * np.sin(t * 8))
            draw.ellipse([W//2 - 165 - dot_r, 92 - dot_r, W//2 - 165 + dot_r, 92 + dot_r], fill=(16, 185, 129))
            draw.text((W//2 - 145, 80), "COIMBATORE • LIVE LAUNCH", font=f_badge, fill=(240, 253, 244))
            
            # Big Logo
            logo_y = 160
            draw_rounded_rect(draw, [W//2 - 150, logo_y, W//2 + 150, logo_y + 65], 16, fill=(16, 185, 129), outline=(52, 211, 153), width=2)
            draw.text((W//2 - 120, logo_y + 12), "SWIFLOAD", font=f_hero, fill=(10, 15, 26))
            draw.polygon([(W//2 + 115, logo_y + 32), (W//2 + 95, logo_y + 18), (W//2 + 95, logo_y + 46)], fill=(10, 15, 26))
            
            # Hook Question
            hook_y = 280
            draw.text((W//2 - 270, hook_y), "NEED TO MOVE GOODS", font=f_hero, fill=(255, 255, 255))
            draw.text((W//2 - 220, hook_y + 55), "IN COIMBATORE?", font=f_hero, fill=(16, 185, 129))
            
            # Feature Cards
            cards_y = 440
            features = [
                ("⚡ Book Vehicle in 60 Seconds", "No phone calls, no driver bargaining"),
                ("📍 Transparent Distance Slabs", "Accurate Kovai zonal pricing from ₹40"),
                ("🚚 2-Wheeler to Tata Ace Fleet", "From parcel deliveries to 1-ton cargo"),
                ("🟢 Instant Google Pay (GPay) & UPI", "Seamless 1-tap in-app digital checkout"),
            ]
            
            for idx, (f_title_text, f_sub_text) in enumerate(features):
                card_t = t - 0.3 * idx
                if card_t > 0:
                    c_fade = min(1.0, card_t / 0.4)
                    y_pos = cards_y + idx * 115
                    draw_rounded_rect(draw, [45, y_pos, W - 45, y_pos + 95], 18, fill=(18, 25, 40), outline=(30, 41, 59), width=1)
                    draw_rounded_rect(draw, [55, y_pos + 12, 60, y_pos + 83], 3, fill=(16, 185, 129))
                    draw.text((75, y_pos + 18), f_title_text, font=f_card_title, fill=(255, 255, 255))
                    draw.text((75, y_pos + 52), f_sub_text, font=f_card_sub, fill=(148, 163, 184))
                    
            # Bottom Kovai Tag
            draw.text((W//2 - 210, 1020), "Covering Gandhipuram, Peelamedu, RS Puram,", font=f_small, fill=(148, 163, 184))
            draw.text((W//2 - 180, 1045), "Saravanampatti, Kurichi & All Industrial Hubs", font=f_small, fill=(16, 185, 129))

        # =========================================================================
        # SCENE 2: 2.5s to 5.0s (Frames 75 to 150) - Multi-Vehicle Fleet & Slab Rates
        # =========================================================================
        elif t < 5.0:
            scene_t = t - 2.5
            
            # Header
            draw_rounded_rect(draw, [W//2 - 180, 65, W//2 + 180, 110], 20, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((W//2 - 150, 75), "ON-DEMAND FLEET AT YOUR FINGERTIPS", font=f_badge, fill=(52, 211, 153))
            
            draw.text((W//2 - 260, 135), "CHOOSE YOUR VEHICLE", font=f_hero, fill=(255, 255, 255))
            draw.text((W//2 - 230, 190), "Tailored for Every Goods Size & Weight", font=f_subtitle, fill=(148, 163, 184))
            
            # Fleet Cards
            vehicles = [
                ("🛵 2-Wheeler (Bike)", "Up to 20 kg • Documents, Parcels & Food", "Base: ₹40 (0-1 km)"),
                ("🛺 3-Wheeler Loader", "Up to 500 kg • Retail Boxes, Electronics", "Base: ₹160 (0-1 km)"),
                ("🚚 Tata Ace (Chota Hathi)", "Up to 850 kg • Industrial Goods & Machines", "Base: ₹250 (0-1 km)"),
                ("🚛 Pickup 8ft Commercial", "Up to 1,200 kg • Heavy Machinery & Textiles", "Base: ₹350 (0-1 km)"),
            ]
            
            card_start_y = 250
            for i, (v_name, v_cap, v_rate) in enumerate(vehicles):
                v_t = scene_t - 0.2 * i
                if v_t > 0:
                    y_box = card_start_y + i * 145
                    draw_rounded_rect(draw, [40, y_box, W - 40, y_box + 125], 20, fill=(20, 29, 46), outline=(52, 211, 153) if i == 2 else (40, 53, 75), width=2 if i == 2 else 1)
                    
                    # Highlight Tata Ace with a badge
                    if i == 2:
                        draw_rounded_rect(draw, [W - 170, y_box + 12, W - 55, y_box + 38], 10, fill=(16, 185, 129))
                        draw.text((W - 160, y_box + 16), "MOST POPULAR", font=get_font(12, bold=True), fill=(10, 15, 26))
                    
                    draw.text((65, y_box + 16), v_name, font=f_card_title, fill=(255, 255, 255))
                    draw.text((65, y_box + 52), v_cap, font=f_card_sub, fill=(148, 163, 184))
                    
                    # Rate badge
                    draw_rounded_rect(draw, [65, y_box + 85, 240, y_box + 112], 8, fill=(16, 32, 28))
                    draw.text((75, y_box + 89), v_rate, font=f_small, fill=(52, 211, 153))
            
            # Bottom callout
            draw_rounded_rect(draw, [50, 920, W - 50, 1020], 18, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
            draw.text((W//2 - 200, 935), "NO HIDDEN CHARGES • NO SURPRISES", font=f_badge, fill=(10, 15, 26))
            draw.text((W//2 - 215, 968), "Live Slab Calculator directly in Mobile App", font=f_subtitle, fill=(10, 15, 26))

        # =========================================================================
        # SCENE 3: 5.0s to 7.5s (Frames 150 to 225) - Live Radar & Google Pay (GPay)
        # =========================================================================
        elif t < 7.5:
            scene_t = t - 5.0
            
            # Header
            draw_rounded_rect(draw, [W//2 - 170, 65, W//2 + 170, 110], 20, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((W//2 - 140, 75), "SMART LOGISTICS TECHNOLOGY", font=f_badge, fill=(52, 211, 153))
            
            draw.text((W//2 - 270, 135), "LIVE RADAR & EASY PAY", font=f_hero, fill=(255, 255, 255))
            draw.text((W//2 - 230, 190), "Track Every Kilometer From Pickup to Drop", font=f_subtitle, fill=(148, 163, 184))
            
            # Simulated Radar Map Box
            map_y = 250
            draw_rounded_rect(draw, [40, map_y, W - 40, map_y + 360], 22, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
            
            # Map grid lines
            for gx in range(60, W - 60, 60):
                draw.line([(gx, map_y + 20), (gx, map_y + 340)], fill=(30, 41, 59), width=1)
            for gy in range(map_y + 40, map_y + 340, 50):
                draw.line([(60, gy), (W - 60, gy)], fill=(30, 41, 59), width=1)
                
            # Animated Route Curve
            pts = [(100, map_y + 280), (220, map_y + 220), (360, map_y + 240), (500, map_y + 140), (600, map_y + 100)]
            draw.line(pts, fill=(52, 211, 153), width=5)
            
            # Animated truck moving along the route
            t_ratio = (scene_t / 2.5) % 1.0
            pt_idx = int(t_ratio * (len(pts) - 1))
            sub_ratio = (t_ratio * (len(pts) - 1)) - pt_idx
            p1 = pts[pt_idx]
            p2 = pts[min(len(pts) - 1, pt_idx + 1)]
            truck_x = int(p1[0] + (p2[0] - p1[0]) * sub_ratio)
            truck_y = int(p1[1] + (p2[1] - p1[1]) * sub_ratio)
            
            # Radar waves around the truck
            pulse = int((scene_t * 6) % 3)
            for r_p in range(1, 4):
                draw.ellipse([truck_x - 15*r_p, truck_y - 15*r_p, truck_x + 15*r_p, truck_y + 15*r_p], outline=(16, 185, 129), width=1)
            draw_rounded_rect(draw, [truck_x - 14, truck_y - 14, truck_x + 14, truck_y + 14], 8, fill=(16, 185, 129))
            
            # Waypoint labels
            draw.text((80, map_y + 295), "📍 Pickup: Lakshmi Mills", font=f_small, fill=(240, 253, 244))
            draw.text((430, map_y + 70), "🏁 Drop: Saravanampatti IT", font=f_small, fill=(52, 211, 153))
            
            # ETA Pill
            draw_rounded_rect(draw, [W//2 - 120, map_y + 300, W//2 + 120, map_y + 345], 14, fill=(10, 15, 26), outline=(16, 185, 129), width=1)
            draw.text((W//2 - 95, map_y + 312), "⏱️ LIVE ETA: 12 MINS", font=f_card_title, fill=(240, 253, 244))
            
            # Google Pay Highlight Box
            gpay_y = 640
            draw_rounded_rect(draw, [40, gpay_y, W - 40, gpay_y + 190], 22, fill=(24, 34, 53), outline=(59, 130, 246), width=2)
            
            # GPay Badge
            draw_rounded_rect(draw, [65, gpay_y + 20, 185, gpay_y + 65], 12, fill=(255, 255, 255))
            draw.text((78, gpay_y + 26), "G Pay", font=get_font(26, bold=True), fill=(30, 41, 59))
            
            draw.text((205, gpay_y + 28), "1-Tap In-App Google Pay (GPay)", font=f_card_title, fill=(255, 255, 255))
            draw.text((65, gpay_y + 80), "• Instant UPI Intent payment with zero transaction surcharge", font=f_subtitle, fill=(203, 213, 225))
            draw.text((65, gpay_y + 115), "• PhonePe, Netbanking, SwifLoad Wallet & Cash on Drop", font=f_subtitle, fill=(148, 163, 184))
            draw.text((65, gpay_y + 150), "• Secure 2-Step OTP Handover (Pickup & Proof of Delivery)", font=f_small, fill=(52, 211, 153))
            
            # Security badge
            draw_rounded_rect(draw, [80, 860, W - 80, 930], 16, fill=(16, 32, 28))
            draw.text((W//2 - 200, 885), "🔒 100% Verified Drivers • Live Trip Insurance", font=f_card_title, fill=(52, 211, 153))

        # =========================================================================
        # SCENE 4: 7.5s to 10.0s (Frames 225 to 300) - Climax & High-Impact CTA
        # =========================================================================
        else:
            scene_t = t - 7.5
            
            if poster_img is not None:
                # Ken Burns zoom on poster
                zoom_factor = 1.0 + 0.05 * (scene_t / 2.5)
                nw, nh = int(W * zoom_factor), int(H * zoom_factor)
                zoomed = poster_img.resize((nw, nh), Image.Resampling.BILINEAR)
                crop_x = (nw - W) // 2
                crop_y = (nh - H) // 2
                bg.paste(zoomed.crop((crop_x, crop_y, crop_x + W, crop_y + H)))
            
            # Dark gradient overlay for readable text at bottom
            overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            o_draw = ImageDraw.Draw(overlay)
            for y_g in range(650, H):
                alpha = int(220 * (y_g - 650) / (H - 650))
                o_draw.line([(0, y_g), (W, y_g)], fill=(10, 15, 26, alpha))
            bg = Image.alpha_composite(bg.convert('RGBA'), overlay).convert('RGB')
            draw = ImageDraw.Draw(bg)
            
            # Floating CTA Box
            cta_y = 820
            draw_rounded_rect(draw, [35, cta_y, W - 35, 1200], 26, fill=(10, 15, 26), outline=(16, 185, 129), width=3)
            
            # Pulsing CTA Button
            pulse_scale = int(4 * np.sin(scene_t * 8))
            draw_rounded_rect(draw, [55 - pulse_scale, cta_y + 25 - pulse_scale, W - 55 + pulse_scale, cta_y + 100 + pulse_scale], 20, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
            draw.text((W//2 - 200, cta_y + 45), "DOWNLOAD SWIFLOAD APP", font=f_cta, fill=(10, 15, 26))
            
            # App details
            draw.text((W//2 - 210, cta_y + 125), "📱 Native Android APK & Web App (PWA)", font=f_subtitle, fill=(240, 253, 244))
            draw.text((W//2 - 180, cta_y + 165), "swifload-cbe.azurewebsites.net", font=f_url, fill=(52, 211, 153))
            
            # Hashtags
            draw.text((W//2 - 230, cta_y + 215), "📍 #Coimbatore #Logistics #TataAce #GPay", font=f_card_sub, fill=(148, 163, 184))
            draw.text((W//2 - 210, cta_y + 245), "Coimbatore's Fast On-Demand Goods Delivery", font=f_small, fill=(203, 213, 225))
            
            # Top Banner
            draw_rounded_rect(draw, [W//2 - 180, 50, W//2 + 180, 100], 16, fill=(10, 15, 26), outline=(16, 185, 129), width=2)
            draw.text((W//2 - 145, 62), "BOOK YOUR DELIVERY NOW", font=f_badge, fill=(52, 211, 153))

        # =========================================================================
        # Universal Progress Bar (Top)
        # =========================================================================
        bar_w = int(W * progress)
        draw.rectangle([0, 0, W, 8], fill=(30, 41, 59))
        draw.rectangle([0, 0, bar_w, 8], fill=(16, 185, 129))
        
        # Convert PIL to OpenCV BGR
        cv_frame = cv2.cvtColor(np.array(bg), cv2.COLOR_RGB2BGR)
        out.write(cv_frame)
        
        if frame_idx % 60 == 0:
            print(f"Processed {frame_idx}/{TOTAL_FRAMES} frames ({int(progress*100)}%)...")
            
    out.release()
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Video successfully generated at: {output_path}")
    print(f"File Size: {file_size_mb:.2f} MB | Duration: {DURATION_SEC}s @ {FPS} FPS")

if __name__ == '__main__':
    create_video()
