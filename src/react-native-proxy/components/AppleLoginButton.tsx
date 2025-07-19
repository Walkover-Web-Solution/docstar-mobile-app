import {
  appleAuth,
  AppleButton
} from '@invertase/react-native-apple-authentication';
import React from 'react';
import { Platform } from 'react-native';
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
    urlLink:string
  }
}) => {

  const handleAppleLogin = async () => {
    try {
      if (appleAuth?.isSupported) {
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN
        });

        const { user ,identityToken , authorizationCode } = appleAuthRequestResponse;
        const state = feature?.urlLink?.split('state=')[1]?.split('&')[0];

        console.log('state -0-0-0-0-',state)
        console.log('identityToken -0-0-0-0-0-',identityToken)
        console.log('user -0-0-0-0-0-',user)
        console.log('code -0-0-',authorizationCode)
        
        if (!identityToken) {
          throw new Error('Apple Sign-In failed - no identity token returned.');
        }

        // Optional: Make a proxy request like you do with Google, if needed
        const proxyResponse = await FeatureApis.getProxyAuthToken(state, identityToken);

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
