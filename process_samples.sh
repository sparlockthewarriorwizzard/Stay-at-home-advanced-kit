#!/bin/bash

# Source Directory
SRC="src/assets/sounds/Essential Pop Moments Vol 2 Kit 1  86BPM  CMinor"
DEST="src/assets/sounds/kits/default"

# Duration: 8 bars at 86 BPM = 22.32 seconds
DURATION="22.32"

# Function to process a file
process_file() {
    INPUT_FILE="$1"
    OUTPUT_FILE="$2"
    
    echo "Processing $INPUT_FILE -> $OUTPUT_FILE"
    
    # 1. Remove starting silence (-30dB threshold)
    # 2. Trim to 8 bars (-t)
    # 3. Overwrite (-y)
    ffmpeg -y -i "$SRC/$INPUT_FILE" \
        -af "silenceremove=start_periods=1:start_threshold=-30dB:start_silence=0" \
        -t "$DURATION" \
        "$DEST/$OUTPUT_FILE"
}

# Process the stems
process_file "EPMV2K1 Trapkick.wav" "kick/Row_2.wav"
process_file "EPMV2K1 Clap.wav" "clap/Row_2.wav"
process_file "EPMV2K1 Hi Hat Open.wav" "tops/Row_2.wav"
process_file "EPMV2K1 Kick Tom.wav" "bass/Row_2.wav"
process_file "EPMV2K1 Piano.wav" "chords/Row_2.wav"
process_file "EPMV2K1 Guitar01.wav" "vocal/Row_2.wav"
process_file "EPMV2K1 Pad 01.wav" "adds/Row_2.wav"
process_file "EPMV2K1 FX 01.wav" "fx/Row_2.wav"

echo "Done processing samples."

