#!/bin/bash

# Target Directory
TARGET_DIR="src/assets/sounds/kits/default"

echo "Optimizing WAV files in $TARGET_DIR to 22050Hz 16-bit PCM..."

# Find all WAV files
find "$TARGET_DIR" -name "*.wav" | while read FILE; do
    echo "Processing $FILE..."
    
    # Create temp file
    TMP_FILE="${FILE%.wav}_opt.wav"
    
    # -ar 22050: Set Audio Rate to 22.05kHz
    # -ac 2: Force Stereo (or keep 2)
    # -pcm_s16le: Force 16-bit PCM
    ffmpeg -y -v error -i "$FILE" -ar 22050 -ac 2 -c:a pcm_s16le "$TMP_FILE"
    
    # Replace original
    mv "$TMP_FILE" "$FILE"
done

echo "Optimization Complete."
