import os
import sys
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANDROID_DIR = os.path.join(BASE_DIR, "android")
PUBLIC_DOWNLOADS = os.path.join(BASE_DIR, "public", "downloads")
CUSTOMER_SRC = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "customer", "release", "app-customer-release.apk")
DRIVER_SRC = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "driver", "release", "app-driver-release.apk")
CUSTOMER_DST = os.path.join(PUBLIC_DOWNLOADS, "SwifLoad-Customer.apk")
DRIVER_DST = os.path.join(PUBLIC_DOWNLOADS, "SwifLoad-Driver.apk")


def build_apks():
    print("[*] Rebuilding SwifLoad APKs with Gradle (v1 + v2 Signature Scheme)...")
    env = os.environ.copy()
    if os.path.exists(r"C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"):
        env["JAVA_HOME"] = r"C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"

    gradle_cmd = os.path.join(ANDROID_DIR, "gradlew.bat" if sys.platform == "win32" else "gradlew")
    res = subprocess.run([gradle_cmd, "assembleCustomerRelease", "assembleDriverRelease"], cwd=ANDROID_DIR, env=env)
    if res.returncode != 0:
        print("[!] Gradle build failed!")
        sys.exit(res.returncode)

    os.makedirs(PUBLIC_DOWNLOADS, exist_ok=True)
    shutil.copy2(CUSTOMER_SRC, CUSTOMER_DST)
    shutil.copy2(DRIVER_SRC, DRIVER_DST)
    print(f"[OK] Customer APK copied -> {CUSTOMER_DST} ({os.path.getsize(CUSTOMER_DST):,} bytes)")
    print(f"[OK] Driver APK copied   -> {DRIVER_DST} ({os.path.getsize(DRIVER_DST):,} bytes)")

    # Verify signatures
    apksigner = r"G:\Android\Sdk\build-tools\34.0.0\apksigner.bat"
    if os.path.exists(apksigner):
        print("\n[*] Verifying APK signatures with apksigner:")
        subprocess.run([apksigner, "verify", "-v", CUSTOMER_DST])
        subprocess.run([apksigner, "verify", "-v", DRIVER_DST])


if __name__ == "__main__":
    build_apks()
