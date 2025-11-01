# react-native-proxy

react-native-proxy

## Installation

Prerequisite:
1. If you're using RN >= 0.73, you're good to go.
2. Project in GCP Console 
3. NON FIREBASE PROJECT


FOR ANDROID ONLY

## Usage

step 1: Install dependencies
npm install react-native-proxy
npm install @react-native-async-storage/async-storage
npm install @react-native-google-signin/google-signin

step 2: Code (Show google login/signin button)
import {ShowProxyAuth} from 'react-native-proxy'

<ShowProxyAuth
    referenceId=<YOUR REF ID>
    onLoginSuccess={handleLoginSuccess}
    onLoginFailure={handleLoginFailure}
/>

Step 3: Google Cloud Console Configuation

Configure SHA1 key for debug 
1. From your project root, cd android && ./gradlew signingReport.
2. Scroll to the top of output, see the fingerprints. Debug fingerprint is used for debug apk, release fingerprint is used for release APK.
3. Select "When not using Firebase" tab Add SHA1 Key on google cloud console ( https://react-native-google-signin.github.io/docs/setting-up/get-config-file?firebase-or-not=cloud-console#step-2 )

Important:
1. Map correct SHA1 to GCP consile
2. Map correct package name to GCP console


FOR IOS ONLY
To use this on iOS, you must manually configure the following:

1. for Sign-In with Apple

Ensure you have the following setup on proxy dashboard under apple authentication feature:
- App ID
- Client ID
- Key ID
- .p8 private key file from Apple Developer → Keys section

These are required for handling Google Sign-In via Apple.

2. Sign-In via Google
- Configure URL Scheme
- Open your Info.plist and add:

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>

Replace YOUR_CLIENT_ID with the one from your GCP console (without .apps.googleusercontent.com suffix).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
