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

def generate_electronic_synth_beat(output_wav, duration=25.0, sr=44100, bpm=126):
    total_samples = int(sr * duration)
    beat_dur = 60.0 / bpm
    audio = np.zeros(total_samples, dtype=np.float32)
    num_beats = int(duration / beat_dur)
    
    # 1. Kick Drum (driving 4-on-the-floor)
    for b in range(num_beats):
        b_idx = int(b * beat_dur * sr)
        k_len = int(0.22 * sr)
        if b_idx + k_len < total_samples:
            k_t = np.linspace(0, 0.22, k_len, endpoint=False)
            freq = 42 + 130 * np.exp(-k_t * 30)
            kick = np.sin(2 * np.pi * freq * k_t) * np.exp(-k_t * 11)
            audio[b_idx:b_idx+k_len] += kick * 0.78

    # 2. Cyber Snare / Claps (beats 2 & 4)
    for b in range(num_beats):
        if b % 2 == 1:
            s_idx = int(b * beat_dur * sr)
            s_len = int(0.2 * sr)
            if s_idx + s_len < total_samples:
                s_t = np.linspace(0, 0.2, s_len, endpoint=False)
                noise = np.random.uniform(-1, 1, s_len) * np.exp(-s_t * 16)
                tone = np.sin(2 * np.pi * 190 * s_t) * np.exp(-s_t * 22)
                snare = (noise * 0.75 + tone * 0.25) * 0.58
                audio[s_idx:s_idx+s_len] += snare

    # 3. Hi-Hats (16th notes syncopation)
    num_sixteenths = int(duration / (beat_dur / 4))
    for s in range(num_sixteenths):
        h_idx = int(s * (beat_dur / 4) * sr)
        h_len = int(0.045 * sr)
        if h_idx + h_len < total_samples:
            h_t = np.linspace(0, 0.045, h_len, endpoint=False)
            vel = 0.28 if s % 4 == 2 else (0.16 if s % 2 == 1 else 0.08)
            hihat = np.random.uniform(-1, 1, h_len) * np.exp(-h_t * 65) * vel
            audio[h_idx:h_idx+h_len] += hihat

    # 4. Driving Synth Bassline (A minor synthwave)
    notes = [55, 55, 55, 58, 62, 62, 60, 58]
    for s in range(num_sixteenths):
        sb_idx = int(s * (beat_dur / 4) * sr)
        sb_len = int(0.11 * sr)
        note_freq = notes[(s // 4) % len(notes)]
        if sb_idx + sb_len < total_samples:
            sb_t = np.linspace(0, 0.11, sb_len, endpoint=False)
            saw = (np.sin(2 * np.pi * note_freq * sb_t) + 
                   0.55 * np.sin(2 * np.pi * note_freq * 2 * sb_t) + 
                   0.25 * np.sin(2 * np.pi * note_freq * 3 * sb_t))
            bass = saw * np.exp(-sb_t * 14) * 0.40
            audio[sb_idx:sb_idx+sb_len] += bass

    # 5. Lead Arp Melody
    arp_notes = [440, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 523.25, 987.77, 880]
    for s in range(num_sixteenths):
        if s >= 16:
            a_idx = int(s * (beat_dur / 4) * sr)
            a_len = int(0.14 * sr)
            freq = arp_notes[s % len(arp_notes)]
            if a_idx + a_len < total_samples:
                a_t = np.linspace(0, 0.14, a_len, endpoint=False)
                lead = (np.sin(2 * np.pi * freq * a_t) + 0.35 * np.sin(2 * np.pi * freq * 2 * a_t)) * np.exp(-a_t * 10) * 0.28
                audio[a_idx:a_idx+a_len] += lead

    # Fade out
    fade_len = int(1.5 * sr)
    audio[-fade_len:] *= np.linspace(1.0, 0.0, fade_len)
    audio = audio / (np.max(np.abs(audio)) + 1e-6) * 0.96
    wavfile.write(output_wav, sr, (audio * 32767).astype(np.int16))
    print(f"Generated 25s electronic synth soundtrack: {output_wav}")

def render_real_screenshots_video():
    W, H = 720, 1280
    FPS = 30
    DURATION_SEC = 25.0 # 5 stages x 5.0 seconds each = 25.0 seconds
    TOTAL_FRAMES = int(FPS * DURATION_SEC) # 750 frames

    # Stage Configurations with the ACTUAL screenshots captured from the app
    stages = [
        {
            "id": 1,
            "badge": "STAGE 1/5: CUSTOMER APP • INSTANT BOOKING",
            "title": "VEHICLE SELECTION & SLAB PRICING",
            "subtitle": "Kovai Zonal Distance Slabs + 1-Tap Google Pay",
            "screenshot": "step1_customer_booking.png",
            "highlight": "📍 Gandhipuram ➔ Peelamedu • Tata Ace ₹380 • GPay Ready",
            "color": (16, 185, 129),
        },
        {
            "id": 2,
            "badge": "STAGE 2/5: DRIVER-PARTNER APP • DISPATCH",
            "title": "REAL-TIME DRIVER DISPATCH ALERT",
            "subtitle": "Instant Cloud SSE Broadcast to Nearest Driver",
            "screenshot": "step2_driver_dispatch.png",
            "highlight": "👨‍✈️ Driver Suresh Kumar (Tata Ace) • ₹311.60 Guaranteed Payout",
            "color": (245, 158, 11),
        },
        {
            "id": 3,
            "badge": "STAGE 3/5: CUSTOMER & DRIVER • LIVE RADAR",
            "title": "REAL-TIME GPS MAP TRACKING",
            "subtitle": "Live Leaflet Route Polyline & Sub-Second Telemetry",
            "screenshot": "step3_customer_tracking.png",
            "highlight": "🚚 Live Truck Position on Avinashi Road • ETA 11 Mins",
            "color": (59, 130, 246),
        },
        {
            "id": 4,
            "badge": "STAGE 4/5: DRIVER APP • SECURE HANDOVER",
            "title": "2-STEP OTP & PROOF OF DELIVERY",
            "subtitle": "Geotagged Photo POD & Zero-Dispute Verification",
            "screenshot": "step4_driver_delivery_pod.png",
            "highlight": "🔒 4-Digit Delivery OTP 4892 Verified • Trip Completed",
            "color": (16, 185, 129),
        },
        {
            "id": 5,
            "badge": "STAGE 5/5: DRIVER APP • WALLET SETTLEMENT",
            "title": "INSTANT DIGITAL EARNINGS SETTLEMENT",
            "subtitle": "Immediate Wallet Balance Credit & Bank Transfer",
            "screenshot": "step5_driver_wallet.png",
            "highlight": "👛 +₹311.60 Credited Instantly • 1-Tap Daily Payout",
            "color": (139, 92, 246),
        },
    ]

    # Load and prepare images
    img_dir = os.path.join(os.getcwd(), 'public', 'downloads', 'real_app_screenshots')
    loaded_screens = []
    for stg in stages:
        p = os.path.join(img_dir, stg['screenshot'])
        if os.path.exists(p):
            im = Image.open(p).convert('RGB')
        else:
            im = Image.new('RGB', (824, 1830), (20, 30, 45))
        loaded_screens.append(im)

    # Fonts
    f_badge = get_font(18, bold=True)
    f_title = get_font(28, bold=True)
    f_subtitle = get_font(18, bold=False)
    f_highlight = get_font(18, bold=True)
    f_brand = get_font(22, bold=True)
    f_small = get_font(14, bold=False)

    temp_video_raw = os.path.join(os.getcwd(), 'temp_video_raw.mp4')
    temp_audio_wav = os.path.join(os.getcwd(), 'temp_synth_beat.wav')
    final_output_mp4 = os.path.join(os.getcwd(), 'SwifLoad-Real-App-Workflow-Promo.mp4')
    public_output_mp4 = os.path.join(os.getcwd(), 'public', 'downloads', 'SwifLoad-Promo-Reel.mp4')

    # Step 1: Synthesize Audio
    generate_electronic_synth_beat(temp_audio_wav, duration=DURATION_SEC)

    # Step 2: Render Video Frames
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_video_raw, fourcc, float(FPS), (W, H))

    # Phone Frame Geometry
    phone_x = 55
    phone_y = 175
    phone_w = W - 2 * phone_x # 610 px
    phone_h = 935 # 935 px
    screen_corner = 28

    print(f"Rendering 25-second real screenshot video ({TOTAL_FRAMES} frames)...")

    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        progress = frame_idx / float(TOTAL_FRAMES)

        # Active stage index (0 to 4)
        stage_idx = min(4, int(t / 5.0))
        stg = stages[stage_idx]
        stg_t = t - stage_idx * 5.0 # time inside current stage (0.0 to 5.0s)
        stg_ratio = stg_t / 5.0

        # Background: Modern obsidian with colored ambient glow
        bg = Image.new('RGB', (W, H), (9, 13, 22))
        draw = ImageDraw.Draw(bg)

        # Animated colored glow behind phone
        glow_col = stg['color']
        dark_glow = (int(glow_col[0] * 0.15), int(glow_col[1] * 0.15), int(glow_col[2] * 0.15))
        draw.ellipse([W//2 - 280, 550 - 280, W//2 + 280, 550 + 280], fill=dark_glow)

        # ---------------------------------------------------------------------
        # TOP HEADER HUD (0 to 170 px)
        # ---------------------------------------------------------------------
        # Stage Badge Pill
        draw_rounded_rect(draw, [40, 35, W - 40, 75], 14, fill=(16, 26, 38), outline=stg['color'], width=1)
        draw.text((60, 43), stg['badge'], font=f_badge, fill=stg['color'])

        # Stage Main Title
        draw.text((42, 90), stg['title'], font=f_title, fill=(255, 255, 255))
        draw.text((42, 130), stg['subtitle'], font=f_subtitle, fill=(148, 163, 184))

        # ---------------------------------------------------------------------
        # SMARTPHONE MOCKUP & REAL SCREENSHOT DISPLAY (175 to 1110 px)
        # ---------------------------------------------------------------------
        # Phone Outer Chassis (Metallic Titanium bezel)
        draw_rounded_rect(draw, [phone_x - 6, phone_y - 6, phone_x + phone_w + 6, phone_y + phone_h + 6], 
                          screen_corner + 6, fill=(35, 45, 60), outline=(60, 75, 100), width=2)
        
        # Phone Screen Inner Bezel
        draw_rounded_rect(draw, [phone_x, phone_y, phone_x + phone_w, phone_y + phone_h], 
                          screen_corner, fill=(10, 15, 26))

        # Crop & Smooth Pan of the Real App Screenshot
        raw_screen = loaded_screens[stage_idx]
        sw, sh = raw_screen.size # 824 x 1830

        # Scale width to fit phone_w exactly
        scale = phone_w / float(sw)
        scaled_w = phone_w
        scaled_h = int(sh * scale)
        scaled_screen = raw_screen.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)

        # Calculate smooth vertical pan over 5 seconds
        max_scroll = max(0, scaled_h - phone_h)
        # Gentle ease in and out
        scroll_y = int(max_scroll * (0.5 - 0.5 * np.cos(np.pi * stg_ratio)))

        cropped_screen = scaled_screen.crop((0, scroll_y, phone_w, scroll_y + phone_h))

        # Mask corners of screen to match phone rounded corners
        mask = Image.new('L', (phone_w, phone_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, phone_w, phone_h], radius=screen_corner, fill=255)

        bg.paste(cropped_screen, (phone_x, phone_y), mask)

        # Redraw Phone Dynamic Island / Camera Notch on top of screen
        notch_w, notch_h = 130, 24
        notch_x = phone_x + (phone_w - notch_w) // 2
        notch_y = phone_y + 12
        draw_rounded_rect(draw, [notch_x, notch_y, notch_x + notch_w, notch_y + notch_h], 12, fill=(0, 0, 0))
        # Camera sensor dot
        draw.ellipse([notch_x + notch_w - 28, notch_y + 6, notch_x + notch_w - 16, notch_y + 18], fill=(20, 25, 40))

        # Phone Glass Shine / Border overlay
        draw.rounded_rectangle([phone_x, phone_y, phone_x + phone_w, phone_y + phone_h], 
                               radius=screen_corner, outline=stg['color'], width=2)

        # ---------------------------------------------------------------------
        # BOTTOM HIGHLIGHT & CTA BANNER (1125 to 1270 px)
        # ---------------------------------------------------------------------
        draw_rounded_rect(draw, [35, 1125, W - 35, 1220], 18, fill=(16, 26, 40), outline=stg['color'], width=2)
        draw.text((55, 1140), stg['highlight'], font=f_highlight, fill=(240, 253, 244))

        # Bottom sub text
        draw.text((55, 1178), "SWIFLOAD COIMBATORE • LIVE AT swifload-cbe.azurewebsites.net", font=f_small, fill=(52, 211, 153))

        # ---------------------------------------------------------------------
        # UNIVERSAL TOP PROGRESS BAR (0 to 1280 px)
        # ---------------------------------------------------------------------
        bar_w = int(W * progress)
        draw.rectangle([0, 0, W, 8], fill=(25, 35, 50))
        draw.rectangle([0, 0, bar_w, 8], fill=(16, 185, 129))

        cv_frame = cv2.cvtColor(np.array(bg), cv2.COLOR_RGB2BGR)
        out.write(cv_frame)

        if frame_idx % 150 == 0:
            print(f"Rendered {frame_idx}/{TOTAL_FRAMES} frames ({int(progress*100)}%)...")

    out.release()
    print("Video frame rendering complete. Muxing with FFmpeg...")

    # Step 3: FFmpeg Muxing
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
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

    cmd_pub = [
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
    subprocess.run(cmd_pub, check=True)

    # Cleanup temp
    if os.path.exists(temp_video_raw):
        os.remove(temp_video_raw)
    if os.path.exists(temp_audio_wav):
        os.remove(temp_audio_wav)

    fsize = os.path.getsize(final_output_mp4) / (1024 * 1024)
    print(f"SUCCESS! Real App Workflow Video Created at:")
    print(f"-> {final_output_mp4} ({fsize:.2f} MB)")
    print(f"-> {public_output_mp4}")

if __name__ == '__main__':
    render_real_screenshots_video()
