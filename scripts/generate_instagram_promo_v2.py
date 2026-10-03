import os
import cv2
import numpy as np
import scipy.io.wavfile as wavfile
import subprocess
import imageio_ffmpeg
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

def generate_electronic_synth_beat(output_wav, duration=24.0, sr=44100, bpm=126):
    total_samples = int(sr * duration)
    beat_dur = 60.0 / bpm
    audio = np.zeros(total_samples, dtype=np.float32)
    num_beats = int(duration / beat_dur)
    
    # 1. Kick Drum (on every quarter note: 1, 2, 3, 4)
    for b in range(num_beats):
        b_idx = int(b * beat_dur * sr)
        k_len = int(0.22 * sr)
        if b_idx + k_len < total_samples:
            k_t = np.linspace(0, 0.22, k_len, endpoint=False)
            freq = 42 + 120 * np.exp(-k_t * 28)
            kick = np.sin(2 * np.pi * freq * k_t) * np.exp(-k_t * 11)
            audio[b_idx:b_idx+k_len] += kick * 0.75

    # 2. Snare / Cyber Clap (on beats 2 and 4)
    for b in range(num_beats):
        if b % 2 == 1:
            s_idx = int(b * beat_dur * sr)
            s_len = int(0.2 * sr)
            if s_idx + s_len < total_samples:
                s_t = np.linspace(0, 0.2, s_len, endpoint=False)
                noise = np.random.uniform(-1, 1, s_len) * np.exp(-s_t * 16)
                tone = np.sin(2 * np.pi * 190 * s_t) * np.exp(-s_t * 22)
                snare = (noise * 0.75 + tone * 0.25) * 0.55
                audio[s_idx:s_idx+s_len] += snare

    # 3. Hi-Hats (16th note rolls with velocity swing)
    num_sixteenths = int(duration / (beat_dur / 4))
    for s in range(num_sixteenths):
        h_idx = int(s * (beat_dur / 4) * sr)
        h_len = int(0.045 * sr)
        if h_idx + h_len < total_samples:
            h_t = np.linspace(0, 0.045, h_len, endpoint=False)
            vel = 0.28 if s % 4 == 2 else (0.16 if s % 2 == 1 else 0.09)
            hihat = np.random.uniform(-1, 1, h_len) * np.exp(-h_t * 65) * vel
            audio[h_idx:h_idx+h_len] += hihat

    # 4. Driving Synthwave Bassline (Pulsing 16th notes with filter envelope)
    notes = [55, 55, 55, 58, 62, 62, 60, 58] # Bass root notes (A minor key)
    for s in range(num_sixteenths):
        sb_idx = int(s * (beat_dur / 4) * sr)
        sb_len = int(0.11 * sr)
        note_freq = notes[(s // 4) % len(notes)]
        if sb_idx + sb_len < total_samples:
            sb_t = np.linspace(0, 0.11, sb_len, endpoint=False)
            saw = (np.sin(2 * np.pi * note_freq * sb_t) + 
                   0.55 * np.sin(2 * np.pi * note_freq * 2 * sb_t) + 
                   0.25 * np.sin(2 * np.pi * note_freq * 3 * sb_t))
            bass = saw * np.exp(-sb_t * 14) * 0.38
            audio[sb_idx:sb_idx+sb_len] += bass

    # 5. Electronic Arpeggiated Melody Lead
    arp_notes = [440, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 523.25, 987.77, 880]
    for s in range(num_sixteenths):
        if s >= 16: # Start melody after intro 2 bars
            a_idx = int(s * (beat_dur / 4) * sr)
            a_len = int(0.14 * sr)
            freq = arp_notes[s % len(arp_notes)]
            if a_idx + a_len < total_samples:
                a_t = np.linspace(0, 0.14, a_len, endpoint=False)
                lead = (np.sin(2 * np.pi * freq * a_t) + 0.35 * np.sin(2 * np.pi * freq * 2 * a_t)) * np.exp(-a_t * 10) * 0.28
                audio[a_idx:a_idx+a_len] += lead

    # 6. Smooth Fade Out in last 1.5 seconds
    fade_len = int(1.5 * sr)
    fade_curve = np.linspace(1.0, 0.0, fade_len)
    audio[-fade_len:] *= fade_curve

    # Normalize audio
    audio = audio / (np.max(np.abs(audio)) + 1e-6) * 0.96
    audio_int16 = (audio * 32767).astype(np.int16)
    wavfile.write(output_wav, sr, audio_int16)
    print(f"Synthesized 126 BPM electronic/synthwave soundtrack: {output_wav}")

def render_extended_promo_video():
    W, H = 720, 1280
    FPS = 30
    DURATION_SEC = 24.0 # 24 seconds covers all 5 core stages
    TOTAL_FRAMES = int(FPS * DURATION_SEC) # 720 frames
    
    # Load poster if exists
    poster_path = os.path.join(os.getcwd(), 'public', 'downloads', 'swifload-promo-poster.jpg')
    poster_img = None
    if os.path.exists(poster_path):
        poster_img = Image.open(poster_path).convert('RGB')
        poster_img = poster_img.resize((W, H), Image.Resampling.LANCZOS)

    # Fonts
    f_badge = get_font(18, bold=True)
    f_hero = get_font(38, bold=True)
    f_title = get_font(28, bold=True)
    f_subtitle = get_font(20, bold=False)
    f_card_title = get_font(22, bold=True)
    f_card_sub = get_font(16, bold=False)
    f_price = get_font(32, bold=True)
    f_cta = get_font(28, bold=True)
    f_url = get_font(22, bold=True)
    f_small = get_font(14, bold=False)
    f_mono = get_font(20, bold=True)

    temp_video_raw = os.path.join(os.getcwd(), 'temp_video_raw.mp4')
    temp_audio_wav = os.path.join(os.getcwd(), 'temp_synth_beat.wav')
    final_output_mp4 = os.path.join(os.getcwd(), 'SwifLoad-Instagram-Promo-24s.mp4')
    public_output_mp4 = os.path.join(os.getcwd(), 'public', 'downloads', 'SwifLoad-Promo-Reel.mp4')

    # Step 1: Synthesize Audio
    generate_electronic_synth_beat(temp_audio_wav, duration=DURATION_SEC)

    # Step 2: Render Frames to temp raw video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_video_raw, fourcc, float(FPS), (W, H))

    print(f"Rendering 24-second workflow video ({TOTAL_FRAMES} frames)...")

    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        progress = frame_idx / float(TOTAL_FRAMES)

        bg = Image.new('RGB', (W, H), (9, 13, 22))
        draw = ImageDraw.Draw(bg)

        # Ambient background pulse
        glow_rad = int(320 + 30 * np.sin(t * 2))
        draw.ellipse([W//2 - glow_rad, 400 - glow_rad, W//2 + glow_rad, 400 + glow_rad], fill=(12, 35, 30))

        # =========================================================================
        # PHASE 1: 0.0s – 5.0s (Customer App: Booking & Distance Slab Pricing)
        # =========================================================================
        if t < 5.0:
            stage_t = t
            # Top Stage Header
            draw_rounded_rect(draw, [40, 50, W - 40, 95], 16, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((60, 62), "📱 STEP 1: CUSTOMER APP • INSTANT BOOKING", font=f_badge, fill=(52, 211, 153))

            draw.text((45, 120), "BOOK CARGO IN 60 SECS", font=f_hero, fill=(255, 255, 255))
            draw.text((45, 170), "Guaranteed Upfront Kovai Distance Slabs", font=f_subtitle, fill=(148, 163, 184))

            # Phone Container Simulation
            ph_y = 220
            draw_rounded_rect(draw, [40, ph_y, W - 40, ph_y + 780], 28, fill=(18, 25, 40), outline=(30, 41, 59), width=2)

            # Pickup & Drop location pills
            draw_rounded_rect(draw, [65, ph_y + 30, W - 65, ph_y + 115], 16, fill=(24, 34, 53), outline=(16, 185, 129), width=1)
            draw.text((85, ph_y + 42), "🟢 PICKUP POINT", font=get_font(12, bold=True), fill=(52, 211, 153))
            draw.text((85, ph_y + 68), "Gandhipuram Town Hall, Coimbatore", font=f_card_title, fill=(255, 255, 255))

            draw_rounded_rect(draw, [65, ph_y + 130, W - 65, ph_y + 215], 16, fill=(24, 34, 53), outline=(59, 130, 246), width=1)
            draw.text((85, ph_y + 142), "🏁 DROP DESTINATION", font=get_font(12, bold=True), fill=(96, 165, 250))
            draw.text((85, ph_y + 168), "Peelamedu Tech Park (8.4 km)", font=f_card_title, fill=(255, 255, 255))

            # Vehicle Selection Pills
            v_y = ph_y + 235
            draw.text((65, v_y), "Select Delivery Vehicle:", font=f_card_sub, fill=(148, 163, 184))
            v_y += 28
            v_options = [
                ("🛵 2-Wheeler (20kg)", False),
                ("🛺 3-Wheeler (500kg)", False),
                ("🚚 Tata Ace (850kg)", True), # Selected
                ("🚛 Pickup 8ft (1.2T)", False),
            ]
            for idx, (v_txt, is_sel) in enumerate(v_options):
                box_y = v_y + idx * 60
                draw_rounded_rect(draw, [65, box_y, W - 65, box_y + 50], 12, 
                                  fill=(16, 32, 28) if is_sel else (15, 23, 42), 
                                  outline=(16, 185, 129) if is_sel else (30, 41, 59), 
                                  width=2 if is_sel else 1)
                draw.text((85, box_y + 14), v_txt, font=f_card_sub, fill=(255, 255, 255) if is_sel else (148, 163, 184))
                if is_sel:
                    draw_rounded_rect(draw, [W - 170, box_y + 10, W - 80, box_y + 40], 8, fill=(16, 185, 129))
                    draw.text((W - 160, box_y + 15), "SELECTED", font=get_font(11, bold=True), fill=(10, 15, 26))

            # Fare & Google Pay Card
            fare_y = ph_y + 500
            draw_rounded_rect(draw, [65, fare_y, W - 65, fare_y + 150], 18, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
            draw.text((85, fare_y + 18), "Quoted Slab Fare (No Bargaining):", font=f_small, fill=(148, 163, 184))
            draw.text((85, fare_y + 42), "₹380.00", font=f_price, fill=(52, 211, 153))
            
            # Google Pay button
            draw_rounded_rect(draw, [85, fare_y + 90, W - 85, fare_y + 135], 10, fill=(255, 255, 255))
            draw.text((105, fare_y + 100), "G Pay", font=get_font(20, bold=True), fill=(30, 41, 59))
            draw.text((180, fare_y + 102), "1-Tap Google Pay (GPay) / UPI", font=get_font(14, bold=True), fill=(15, 23, 42))

            # Tap Button Action animation
            btn_scale = int(3 * np.sin(stage_t * 6)) if stage_t > 3.0 else 0
            btn_y = ph_y + 680
            draw_rounded_rect(draw, [65 - btn_scale, btn_y, W - 65 + btn_scale, btn_y + 65], 16, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
            draw.text((W//2 - 130, btn_y + 18), "BOOK GOODS VEHICLE ➔", font=f_cta, fill=(10, 15, 26))

        # =========================================================================
        # PHASE 2: 5.0s – 9.5s (Driver App: Real-Time Dispatch & Acceptance)
        # =========================================================================
        elif t < 9.5:
            stage_t = t - 5.0
            # Header
            draw_rounded_rect(draw, [40, 50, W - 40, 95], 16, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((60, 62), "🚚 STEP 2: DRIVER APP • DISPATCH & ACCEPT", font=f_badge, fill=(52, 211, 153))

            draw.text((45, 120), "INSTANT DISPATCH ALERT", font=f_hero, fill=(255, 255, 255))
            draw.text((45, 170), "Real-time SSE Notification to Nearest Driver", font=f_subtitle, fill=(148, 163, 184))

            # Driver Phone Container
            dph_y = 220
            draw_rounded_rect(draw, [40, dph_y, W - 40, dph_y + 780], 28, fill=(18, 25, 40), outline=(16, 185, 129), width=2)

            # Driver Profile Header
            draw_rounded_rect(draw, [65, dph_y + 25, W - 65, dph_y + 115], 16, fill=(24, 34, 53))
            draw.ellipse([85, dph_y + 40, 145, dph_y + 100], fill=(16, 185, 129))
            draw.text((105, dph_y + 55), "👨‍✈️", font=get_font(24))
            draw.text((165, dph_y + 45), "Suresh Kumar (Online)", font=f_card_title, fill=(255, 255, 255))
            draw.text((165, dph_y + 75), "Tata Ace • TN 37 CY 4821 • 4.9 ★", font=f_card_sub, fill=(148, 163, 184))

            # Pulsing Incoming Trip Card
            card_glow = int(4 * np.sin(stage_t * 8))
            alert_y = dph_y + 140
            draw_rounded_rect(draw, [65 - card_glow, alert_y - card_glow, W - 65 + card_glow, alert_y + 360 + card_glow], 22, 
                              fill=(20, 32, 48), outline=(245, 158, 11), width=3)

            # Alert Badge
            draw_rounded_rect(draw, [85, alert_y + 20, 290, alert_y + 55], 10, fill=(245, 158, 11))
            draw.text((95, alert_y + 26), "⚡ NEW BOOKING DISPATCH", font=get_font(12, bold=True), fill=(10, 15, 26))

            draw.text((85, alert_y + 70), "Pickup: Gandhipuram Town Hall", font=f_card_title, fill=(255, 255, 255))
            draw.text((85, alert_y + 105), "Distance to Pickup: 1.2 km (4 mins)", font=f_card_sub, fill=(52, 211, 153))

            draw.text((85, alert_y + 145), "Drop: Peelamedu Tech Park", font=f_card_title, fill=(255, 255, 255))
            draw.text((85, alert_y + 180), "Cargo: Industrial Spare Parts (350 kg)", font=f_card_sub, fill=(148, 163, 184))

            draw_rounded_rect(draw, [85, alert_y + 225, W - 85, alert_y + 330], 14, fill=(10, 15, 26))
            draw.text((105, alert_y + 240), "Driver Net Payout Guarantee:", font=f_small, fill=(148, 163, 184))
            draw.text((105, alert_y + 268), "₹311.60 NET EARNING", font=f_price, fill=(52, 211, 153))

            # Accept Button
            is_accepted = stage_t > 2.2
            btn_acc_y = dph_y + 530
            if is_accepted:
                draw_rounded_rect(draw, [65, btn_acc_y, W - 65, btn_acc_y + 90], 18, fill=(16, 185, 129))
                draw.text((W//2 - 170, btn_acc_y + 28), "✅ TRIP ACCEPTED • EN ROUTE", font=f_cta, fill=(10, 15, 26))
                draw.text((W//2 - 130, btn_acc_y + 120), "Opening Turn-by-Turn GPS Radar...", font=f_card_sub, fill=(52, 211, 153))
            else:
                draw_rounded_rect(draw, [65, btn_acc_y, W - 65, btn_acc_y + 90], 18, fill=(245, 158, 11), outline=(251, 191, 36), width=2)
                draw.text((W//2 - 150, btn_acc_y + 28), "ACCEPT BOOKING (15s)", font=f_cta, fill=(10, 15, 26))

        # =========================================================================
        # PHASE 3: 9.5s – 14.5s (Live GPS Radar Tracking & Goods in Transit)
        # =========================================================================
        elif t < 14.5:
            stage_t = t - 9.5
            # Header
            draw_rounded_rect(draw, [40, 50, W - 40, 95], 16, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((60, 62), "📡 STEP 3: LIVE GPS RADAR • IN TRANSIT", font=f_badge, fill=(52, 211, 153))

            draw.text((45, 120), "REAL-TIME LIVE TRACKING", font=f_hero, fill=(255, 255, 255))
            draw.text((45, 170), "Turn-by-turn Telemetry on Coimbatore Map", font=f_subtitle, fill=(148, 163, 184))

            # Radar Map Viewport
            map_y = 220
            draw_rounded_rect(draw, [40, map_y, W - 40, map_y + 600], 28, fill=(15, 23, 42), outline=(16, 185, 129), width=2)

            # Grid lines
            for gx in range(60, W - 60, 60):
                draw.line([(gx, map_y + 20), (gx, map_y + 580)], fill=(25, 36, 52), width=1)
            for gy in range(map_y + 30, map_y + 580, 50):
                draw.line([(60, gy), (W - 60, gy)], fill=(25, 36, 52), width=1)

            # Route polyline
            route_pts = [
                (100, map_y + 500), # Gandhipuram
                (220, map_y + 420), # Lakshmi Mills
                (360, map_y + 360), # Nava India
                (480, map_y + 240), # Peelamedu
                (600, map_y + 120), # Tech Park
            ]
            draw.line(route_pts, fill=(52, 211, 153), width=6)

            # Animate vehicle progress along route
            ratio = min(1.0, (stage_t / 5.0) * 1.1)
            seg_len = len(route_pts) - 1
            idx = min(seg_len - 1, int(ratio * seg_len))
            sub_r = (ratio * seg_len) - idx
            pA = route_pts[idx]
            pB = route_pts[idx + 1]
            cur_x = int(pA[0] + (pB[0] - pA[0]) * sub_r)
            cur_y = int(pA[1] + (pB[1] - pA[1]) * sub_r)

            # Radar Pulse rings
            for r_ring in [1, 2, 3]:
                ring_rad = int(r_ring * 22 + (stage_t * 20) % 25)
                draw.ellipse([cur_x - ring_rad, cur_y - ring_rad, cur_x + ring_rad, cur_y + ring_rad], outline=(16, 185, 129), width=1)

            # Vehicle Icon
            draw_rounded_rect(draw, [cur_x - 22, cur_y - 22, cur_x + 22, cur_y + 22], 12, fill=(16, 185, 129), outline=(255, 255, 255), width=2)
            draw.text((cur_x - 12, cur_y - 12), "🚚", font=get_font(18))

            # Waypoint labels
            draw.text((70, map_y + 520), "🟢 Gandhipuram", font=f_small, fill=(240, 253, 244))
            draw.text((450, map_y + 85), "🏁 Peelamedu Tech Park", font=f_small, fill=(96, 165, 250))

            # Telemetry HUD Card
            hud_y = map_y + 630
            draw_rounded_rect(draw, [40, hud_y, W - 40, hud_y + 280], 22, fill=(18, 25, 40), outline=(52, 211, 153), width=1)
            
            draw.text((65, hud_y + 20), "SPEED: 38 KM/H • AVINASHI ROAD", font=f_badge, fill=(52, 211, 153))
            
            # Live ETA Pill
            eta_rem = max(2, int(14 - stage_t * 2.2))
            draw_rounded_rect(draw, [65, hud_y + 55, 280, hud_y + 115], 12, fill=(10, 15, 26))
            draw.text((80, hud_y + 65), f"⏱️ ETA: {eta_rem} MINS", font=f_price, fill=(255, 255, 255))

            draw.text((65, hud_y + 135), "• Real-Time Cloud SSE Sync (Sub-Second Latency)", font=f_card_sub, fill=(203, 213, 225))
            draw.text((65, hud_y + 170), "• Live Location Tracking Link Shared with Consignee", font=f_card_sub, fill=(148, 163, 184))
            draw.text((65, hud_y + 205), "• Direct Driver Call & Emergency Support Masked", font=f_card_sub, fill=(148, 163, 184))

        # =========================================================================
        # PHASE 4: 14.5s – 19.0s (Arrival, 2-Step OTP Handover & Proof of Delivery)
        # =========================================================================
        elif t < 19.0:
            stage_t = t - 14.5
            # Header
            draw_rounded_rect(draw, [40, 50, W - 40, 95], 16, fill=(16, 32, 28), outline=(16, 185, 129), width=1)
            draw.text((60, 62), "📦 STEP 4: 2-STEP OTP & PROOF OF DELIVERY", font=f_badge, fill=(52, 211, 153))

            draw.text((45, 120), "SAFE & VERIFIED DELIVERY", font=f_hero, fill=(255, 255, 255))
            draw.text((45, 170), "Zero Disputes • Instant Digital Settlement", font=f_subtitle, fill=(148, 163, 184))

            # POD Card Container
            pod_y = 220
            draw_rounded_rect(draw, [40, pod_y, W - 40, pod_y + 780], 28, fill=(18, 25, 40), outline=(16, 185, 129), width=2)

            # OTP Handover Box
            draw_rounded_rect(draw, [65, pod_y + 30, W - 65, pod_y + 200], 18, fill=(15, 23, 42), outline=(59, 130, 246), width=2)
            draw.text((85, pod_y + 45), "DELIVERY VERIFICATION OTP", font=f_badge, fill=(96, 165, 250))
            draw.text((85, pod_y + 75), "Customer shares 4-digit code at drop:", font=f_card_sub, fill=(148, 163, 184))

            # 4 OTP boxes
            otp_digits = ['4', '8', '9', '2']
            for i, dig in enumerate(otp_digits):
                b_x = 85 + i * 80
                draw_rounded_rect(draw, [b_x, pod_y + 110, b_x + 65, pod_y + 175], 12, fill=(24, 34, 53), outline=(16, 185, 129), width=2)
                draw.text((b_x + 22, pod_y + 125), dig, font=f_price, fill=(255, 255, 255))

            # Photo Proof of Delivery Box
            draw_rounded_rect(draw, [65, pod_y + 220, W - 65, pod_y + 420], 18, fill=(15, 23, 42), outline=(16, 185, 129), width=1)
            draw.text((85, pod_y + 235), "📸 PHOTO PROOF OF DELIVERY (POD)", font=f_badge, fill=(52, 211, 153))
            
            # Simulated Cargo Photo Box
            draw_rounded_rect(draw, [85, pod_y + 270, W - 85, pod_y + 395], 12, fill=(20, 29, 46))
            draw.text((W//2 - 120, pod_y + 310), "📦 Industrial Goods Unloaded", font=f_card_title, fill=(240, 253, 244))
            draw.text((W//2 - 90, pod_y + 345), "Geotagged: Peelamedu", font=f_small, fill=(52, 211, 153))

            # Trip Completed Banner
            draw_rounded_rect(draw, [65, pod_y + 450, W - 65, pod_y + 570], 18, fill=(16, 32, 28), outline=(16, 185, 129), width=2)
            draw.text((85, pod_y + 468), "TRIP STATUS: DELIVERED 🎉", font=f_title, fill=(52, 211, 153))
            draw.text((85, pod_y + 510), "Payment Settled via Google Pay (GPay) • ₹380", font=f_card_sub, fill=(240, 253, 244))
            draw.text((85, pod_y + 535), "GST Invoice dispatches directly to Customer WhatsApp", font=f_small, fill=(148, 163, 184))

            # Instant Wallet Credit Alert for Driver
            draw_rounded_rect(draw, [65, pod_y + 600, W - 65, pod_y + 720], 18, fill=(10, 15, 26), outline=(245, 158, 11), width=2)
            draw.text((85, pod_y + 620), "👛 DRIVER WALLET SETTLEMENT:", font=get_font(13, bold=True), fill=(245, 158, 11))
            draw.text((85, pod_y + 650), "+₹311.60 Credited Instantly", font=f_price, fill=(52, 211, 153))
            draw.text((85, pod_y + 690), "Immediate bank transfer available anytime", font=f_small, fill=(148, 163, 184))

        # =========================================================================
        # PHASE 5: 19.0s – 24.0s (Climax, City-Wide Call to Action & Download)
        # =========================================================================
        else:
            stage_t = t - 19.0
            
            # Ken Burns zoom on high-res promo poster
            if poster_img is not None:
                zoom_factor = 1.0 + 0.06 * (stage_t / 5.0)
                nw, nh = int(W * zoom_factor), int(H * zoom_factor)
                zoomed = poster_img.resize((nw, nh), Image.Resampling.BILINEAR)
                cx = (nw - W) // 2
                cy = (nh - H) // 2
                bg.paste(zoomed.crop((cx, cy, cx + W, cy + H)))

            # Dark gradient at bottom
            overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            o_draw = ImageDraw.Draw(overlay)
            for y_g in range(580, H):
                alpha = int(235 * (y_g - 580) / (H - 580))
                o_draw.line([(0, y_g), (W, y_g)], fill=(9, 13, 22, alpha))
            bg = Image.alpha_composite(bg.convert('RGBA'), overlay).convert('RGB')
            draw = ImageDraw.Draw(bg)

            # Top Badge
            draw_rounded_rect(draw, [W//2 - 180, 50, W//2 + 180, 100], 16, fill=(10, 15, 26), outline=(16, 185, 129), width=2)
            draw.text((W//2 - 150, 62), "NOW LIVE IN COIMBATORE", font=f_badge, fill=(52, 211, 153))

            # Bottom Floating CTA Box
            cta_y = 780
            draw_rounded_rect(draw, [35, cta_y, W - 35, 1210], 28, fill=(10, 15, 26), outline=(16, 185, 129), width=3)

            # Pulsing Button
            pulse = int(4 * np.sin(stage_t * 8))
            draw_rounded_rect(draw, [55 - pulse, cta_y + 25 - pulse, W - 55 + pulse, cta_y + 105 + pulse], 20, fill=(16, 185, 129), outline=(110, 231, 183), width=2)
            draw.text((W//2 - 200, cta_y + 48), "DOWNLOAD SWIFLOAD APP", font=f_cta, fill=(10, 15, 26))

            draw.text((W//2 - 210, cta_y + 130), "📱 Customer & Driver Mobile Apps (Android APK)", font=f_subtitle, fill=(240, 253, 244))
            draw.text((W//2 - 185, cta_y + 175), "swifload-cbe.azurewebsites.net", font=f_url, fill=(52, 211, 153))

            # GPay badge
            draw_rounded_rect(draw, [W//2 - 110, cta_y + 225, W//2 + 110, cta_y + 270], 10, fill=(255, 255, 255))
            draw.text((W//2 - 95, cta_y + 233), "G Pay • UPI Accepted", font=get_font(16, bold=True), fill=(15, 23, 42))

            draw.text((W//2 - 230, cta_y + 300), "📍 #Coimbatore #Logistics #TataAce #GPay", font=f_card_sub, fill=(148, 163, 184))
            draw.text((W//2 - 200, cta_y + 335), "Coimbatore's #1 On-Demand Logistics Network", font=f_small, fill=(203, 213, 225))

        # =========================================================================
        # Universal Progress Bar (Top)
        # =========================================================================
        bar_w = int(W * progress)
        draw.rectangle([0, 0, W, 8], fill=(30, 41, 59))
        draw.rectangle([0, 0, bar_w, 8], fill=(16, 185, 129))

        cv_frame = cv2.cvtColor(np.array(bg), cv2.COLOR_RGB2BGR)
        out.write(cv_frame)

        if frame_idx % 120 == 0:
            print(f"Processed {frame_idx}/{TOTAL_FRAMES} frames ({int(progress*100)}%)...")

    out.release()
    print("Raw video rendering complete. Muxing video and audio with FFmpeg...")

    # Step 3: FFmpeg Muxing (H.264 + AAC into MP4)
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Generate Root final video
    cmd_root = [
        ffmpeg_exe, '-y',
        '-i', temp_video_raw,
        '-i', temp_audio_wav,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        final_output_mp4
    ]
    subprocess.run(cmd_root, check=True)
    
    # Also output to public/downloads/SwifLoad-Promo-Reel.mp4
    cmd_public = [
        ffmpeg_exe, '-y',
        '-i', temp_video_raw,
        '-i', temp_audio_wav,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        public_output_mp4
    ]
    subprocess.run(cmd_public, check=True)

    # Cleanup temp files
    if os.path.exists(temp_video_raw):
        os.remove(temp_video_raw)
    if os.path.exists(temp_audio_wav):
        os.remove(temp_audio_wav)

    fsize = os.path.getsize(final_output_mp4) / (1024 * 1024)
    print(f"SUCCESS! 24-Second Video with electronic synth music created at:")
    print(f"-> {final_output_mp4} ({fsize:.2f} MB)")
    print(f"-> {public_output_mp4}")

if __name__ == '__main__':
    render_extended_promo_video()
