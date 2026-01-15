import os
import subprocess

TARGET_DIR = "src/assets/sounds/kits/default"

print(f"Optimizing WAV files in {TARGET_DIR}...")

for root, dirs, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith(".wav"):
            full_path = os.path.join(root, file)
            temp_path = os.path.join(root, f"temp_{file}")
            
            print(f"Processing {full_path}...")
            
            # ffmpeg command: 22050Hz, Stereo, 16-bit PCM
            cmd = [
                "ffmpeg", "-y", "-v", "error",
                "-i", full_path,
                "-ar", "22050",
                "-ac", "2",
                "-c:a", "pcm_s16le",
                temp_path
            ]
            
            try:
                subprocess.run(cmd, check=True)
                os.replace(temp_path, full_path)
                print(f"Optimized: {file}")
            except subprocess.CalledProcessError as e:
                print(f"Error processing {file}: {e}")

print("Done.")
