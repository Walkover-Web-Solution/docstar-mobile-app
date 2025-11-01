import React, { useEffect, useState } from 'react';
import {
    View
} from 'react-native';
import { FeatureApis } from '../apis/featureApis';
import GoogleLoginButton from './GoogleLoginButton';
import AppleLoginButton from './AppleLoginButton';
import OTPLoginButton from './OTPLoginButton';
import type { GoogleFeatureType } from '../types/features';

const ProxyAuth = ({
    referenceId,
    onLoginSuccess,
    onLoginFailure,
    buttonText = 'Sign in with Google',
    buttonStyle,
    textStyle,
    loadingColor = '#4285F4',
    disabled = false,
}: {
    referenceId: string,
    onLoginSuccess: (result: any) => void;
    onLoginFailure: (error: any) => void;
    buttonText?: string;
    buttonStyle?: object;
    textStyle?: object;
    loadingColor?: string;
    disabled?: boolean;
}) => {
    const [loading, setLoading] = React.useState(false);
    const [featuresList, setFeaturesList] = useState([])

    useEffect(() => {
        if (referenceId) {
            async function getFeatures() {
                const data = await FeatureApis.getFeatureList(referenceId)
                setFeaturesList(data)
                console.log(data)
            }
            getFeatures()
        }
    }, [referenceId])


    return (
        <View style={{
            gap: 10
        }}>
            {featuresList?.length > 0 && featuresList?.map((feature: GoogleFeatureType, index: number) => {
                
                
                const props = {
                    referenceId,
                    onLoginSuccess,
                    onLoginFailure,
                    buttonText: feature?.text || buttonText,
                    buttonStyle,
                    textStyle,
                    loadingColor,
                    disabled,
                    loading,
                    setLoading, 
                    feature
                }
                switch (feature?.text) {
                    case 'Continue with Google':
                        return <GoogleLoginButton key={`google-${index}`} {...props} />

                    case 'Continue with Apple':
                        return <AppleLoginButton key={`apple-${index}`} {...props} />
                    
                    case 'Login With OTP':
                        return <OTPLoginButton key={`otp-${index}`} {...props} />
                    
                    default:
                        
                        return null
                }
            })}
        </View>
    );
};



export default ProxyAuth;
