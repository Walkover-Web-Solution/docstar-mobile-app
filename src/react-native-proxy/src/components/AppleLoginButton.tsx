import {
  appleAuth,
  AppleButton
} from '@invertase/react-native-apple-authentication';
import { Platform, Alert } from 'react-native';
import { FeatureApis } from '../apis/featureApis';

const AppleLoginButton = ({
  onLoginSuccess,
  onLoginFailure,
  buttonStyle,
  feature
}: {
  onLoginSuccess: (result: any) => void;
  onLoginFailure: (error: any) => void;
  buttonStyle?: object;
  feature: {
    text: string
    urlLink: string
  }
}) => {

  const handleAppleLogin = async () => {
    // Show alert asking user not to hide email
    Alert.alert(
      "Apple Sign In",
      "Please don't hide your email address. We need your email for proper authentication and identification",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Continue",
          onPress: () => performAppleLogin()
        }
      ]
    );
  };

  const performAppleLogin = async () => {
    try {
      if (appleAuth?.isSupported) {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
    console.log(appleAuthRequestResponse,"Apple login ");

        const { identityToken, authorizationCode } = appleAuthRequestResponse;
        const state = feature?.state ?? (feature?.urlLink?.split('state=')[1]?.split('&')[0] || '');
        console.log("state=========",state);
        
        if (!identityToken) {
          throw new Error('Apple Sign-In failed - no identity token returned.');
        }

        // Optional: Make a proxy request like you do with Google, if needed
        const proxyResponse = await FeatureApis.getProxyAuthTokenForAppleAuth(state, identityToken, authorizationCode || '');

        onLoginSuccess && onLoginSuccess(proxyResponse);
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      onLoginFailure && onLoginFailure(error);
    }
  };

  if (Platform.OS !== 'ios') return null;

  return (
    <AppleButton
      style={[{ width: 220, height: 44 }, buttonStyle]}
      cornerRadius={5}
      buttonStyle={AppleButton.Style.DEFAULT}
      buttonType={AppleButton.Type.SIGN_IN}
      onPress={handleAppleLogin}
    />
  );
};

export default AppleLoginButton;
