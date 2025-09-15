# Culture Connect App

This is the frontend mobile application for Culture Connect, built with React Native and Expo.

## 🚀 Getting Started

### Prerequisites

*   Node.js
*   Yarn or npm
*   [Expo Go](https://expo.dev/go) app on your mobile device (for testing)
*   [EAS CLI](https://docs.expo.dev/eas/cli/) for builds

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/culture-connect-app.git
cd culture-connect-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

Update the variables in the new `.env` file with your API keys, service URLs, etc.

### 4. Run in Development

Start the Expo development server:

```bash
npx expo start
```

You can then:
*   Press `a` to open in an Android emulator.
*   Press `i` to open in an iOS simulator (macOS only).
*   Scan the QR code with the Expo Go app on your physical device.

## 🛠️ Building with EAS

We use EAS Build to create APKs and App Bundles.

### 1. Login to EAS

```bash
eas login
```

### 2. Configure Project

```bash
eas build:configure
```

Ensure your `app.json` is configured correctly. Here is an example:

```json
{
  "expo": {
    "name": "TRiVO",
    "slug": "trivo",
    "android": {
      "package": "com.yourorg.trivo",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourorg.trivo"
    },
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### 3. Build for Testing (Android APK)

Generate a directly installable APK:

```bash
eas build -p android --profile preview
```

After the build, you’ll get a download link.
Install on device manually or via ADB:

```bash
adb install app.apk
```

### 4. Build for Release

Android App Bundle (Play Store):

```bash
eas build -p android --profile production
```

iOS (App Store):

```bash
eas build -p ios --profile production
```
