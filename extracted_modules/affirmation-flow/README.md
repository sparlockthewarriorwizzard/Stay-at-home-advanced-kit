# Affirmation Flow Module

This module provides a complete flow for users to:
1. Enter a goal.
2. Receive an AI-generated affirmation and action steps.
3. Record themselves speaking the affirmation.
4. Upload the audio and link it to their goal.

## ⚠️ Important Note: expo-av Deprecation

**`expo-av` is deprecated as of Expo SDK 53 and will be removed in SDK 55.**

This module currently uses `expo-av` for audio recording and playback. For future-proof implementations, you should migrate to **`expo-audio`**.

**INSTRUCTION FOR AI AGENTS:**
Before implementing or refactoring this module in a future session, you **MUST** use the `Context7` MCP server to query the latest documentation for `expo-audio`.
1. Call `resolve-library-id` for `expo-audio`.
2. Call `query-docs` to get the current recording and playback patterns.
3. Refactor `useAffirmation.ts` to match the new API.

*   **Deprecated Package:** `expo-av`
*   **Recommended Replacement:** `expo-audio` (and `expo-video` for video)

**Action Item for Future Sessions:**
When integrating this into a new project (especially one using Expo SDK 53+), refactor `useAffirmation.ts` to use `expo-audio` instead of `expo-av`.

## Installation

1.  **Copy the Files:**
    Copy the `affirmation-flow` folder into your project's source directory (e.g., `src/modules/affirmation-flow`).

2.  **Install Dependencies:**
    This module requires the following packages. Ensure they are installed in your project:

    ```bash
    npm install expo-av expo-file-system axios @expo/vector-icons react-native-safe-area-context
    ```

    *If migrating to `expo-audio`:*
    ```bash
    npm install expo-audio expo-file-system axios @expo/vector-icons react-native-safe-area-context
    ```

3.  **Permissions:**
    Ensure you have configured microphone permissions in your `app.json` or `Info.plist` / `AndroidManifest.xml` if building native binaries.

    **app.json:**
    ```json
    {
      "expo": {
        "plugins": [
          [
            "expo-av",
            {
              "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            }
          ]
        ]
      }
    }
    ```

## Usage

### 1. Initialize the Service

Create an instance of `AffirmationService` with your API base URL.

```typescript
// src/services.ts
import { AffirmationService } from './modules/affirmation-flow/AffirmationService';
import { storage } from './storage'; // Your token storage logic

// Optional: Provide a function to get your auth token
const getToken = async () => await storage.getToken();

export const affirmationService = new AffirmationService('https://your-api-url.com', getToken);
```

### 2. Use the Component

Drop the `AffirmationRecorder` into any screen.

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AffirmationRecorder } from './modules/affirmation-flow/AffirmationRecorder';
import { affirmationService } from './services';

export default function MyScreen() {
    const handleSuccess = () => {
        console.log("Flow completed!");
        // Navigate away or show success message
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <AffirmationRecorder 
                service={affirmationService} 
                onSuccess={handleSuccess}
                primaryColor="#007AFF"
                accentColor="#FFD700"
            />
        </SafeAreaView>
    );
}
```

## Customization

You can customize the basic colors via props:
*   `primaryColor`: Button backgrounds.
*   `secondaryColor`: "Start Over" button text.
*   `accentColor`: Affirmation text and icons.
*   `containerStyle`: Override padding or layout.

For deeper UI changes, modify `AffirmationRecorder.tsx` directly.
