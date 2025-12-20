# React Native AI MVP Starter 🚀
**The "Taste of Success" Boilerplate**

Stop coding from scratch. This repository is an opinionated, production-ready foundation for React Native apps. It is designed for developers who want to skip the "plumbing" (navigation, paywalls, state management) and focus on building the unique features of their MVP immediately.

It is specifically optimized for an **AI-First Workflow**. The folder structure and code style are consistent, making it easy for tools like Gemini, GitHub Copilot, or Cursor to understand and extend.

## ⚡ Features
- **React Native (0.7x+):** Modern functional components with Hooks.
- **Navigation Pre-Wired:** React Navigation (Stack + Tab) set up and ready to go.
- **Monetization Ready:** `react-native-purchases` (RevenueCat) installed with a pre-built PaywallView component.
- **State Management:** Lightweight setup (Zustand or Context API pattern included).
- **AI-Friendly Structure:** Modular file naming to help LLMs understand context without hallucinating paths.

## 🛠 Prerequisites
- Node.js > 18
- Watchman
- Xcode (for iOS) / Android Studio (for Android)
- A RevenueCat account (Free tier is fine for dev).

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/sparlockthewarriorwizzard/react-native-ai-mvp-starter.git
   cd react-native-ai-mvp-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Pod Install (iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure Environment**
   Rename `.env.example` to `.env` and add your keys:
   ```env
   REVENUECAT_API_KEY_IOS=rc_your_ios_key
   REVENUECAT_API_KEY_ANDROID=rc_your_android_key
   ```

5. **Run the App**
   ```bash
   npx react-native run-ios
   # or
   npx react-native run-android
   ```

## 🤖 The AI-First Workflow
This repo is designed to be "Lead Engineer" compliant. When you ask an AI (like Gemini or ChatGPT) to write code for this repo, copy/paste the prompt below to set the context:

**System Prompt for AI:**
> "I am working in the 'React Native AI MVP Starter' codebase.
> It uses Functional Components and TypeScript.
> Navigation is handled by React Navigation (in /navigation).
> Subscriptions are handled by RevenueCat (in /services/revenuecat).
> Do not remove the Paywall checks.
> Focus on the 'Screens' folder for UI logic. Now, please build [YOUR FEATURE HERE]..."

## 💰 Monetization Setup (RevenueCat)
The plumbing is already done. Check `src/services/RevenueCat.ts`.

- **The Hook:** We use a custom hook `useSubscriptionStatus()` that returns `isProMember` (boolean).
- **The Paywall:** A basic paywall UI exists at `src/screens/PaywallScreen.tsx`.

**Implementation:** To gate a feature, simply wrap it:
```javascript
if (!isProMember) {
  navigation.navigate('Paywall');
  return;
}
// Execute premium feature
```

## 📂 Project Structure
```text
/src
  /assets          # Images, fonts
  /components      # Reusable UI (Buttons, Cards)
  /navigation      # Stack and Tab navigators
  /screens         # Main views (Home, Settings, Paywall)
  /services        # API calls, RevenueCat logic
  /theme           # Colors, Typography (AI can easily read this to match style)
  /utils           # Helper functions
App.tsx            # Entry point
```

## 📜 License
MIT. Go build something cool.
