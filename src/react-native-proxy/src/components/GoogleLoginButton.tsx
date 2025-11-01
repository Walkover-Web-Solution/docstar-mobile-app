import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, TouchableOpacity, View, Text, StyleSheet, Platform, Alert } from 'react-native'
import { FeatureApis } from '../apis/featureApis';
import { configureGoogleSignIn } from '../services/providers/googleAuth';
import { login } from '../services/authService';
import type { GoogleFeatureType } from '../types/features';

interface PropsType {
    referenceId: string,
    onLoginSuccess: (result: any) => void;
    onLoginFailure: (error: any) => void;
    buttonText?: string;
    buttonStyle?: object;
    textStyle?: object;
    loadingColor?: string;
    disabled?: boolean;
    config?: any;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    feature: GoogleFeatureType
}

const GOOGLE_LOGO = 'https://developers.google.com/identity/images/g-logo.png';

export default function GoogleLoginButton(props: PropsType) {
    const { feature, loading, disabled, setLoading, onLoginSuccess, onLoginFailure, buttonStyle, loadingColor, textStyle, buttonText } = props;
    const [isConfigured, setIsConfigured] = useState(false);

    // Configure Google Sign-In only once when component mounts
    useEffect(() => {
        const configureGoogle = async () => {
            try {
                console.log('🔧 Configuring Google Sign-In with feature:', feature);
                
                // Use provided Google Client ID for testing
                
                const webClientId = feature?.client_id;
                console.log(webClientId ,"webclient");
            
                 //const webClientId='377730396863-ufrqjlp85mc07rkeqvudde9is875ffg3.apps.googleusercontent.com'
                const iosClientId = feature?.ios_client_id;
                
                console.log('📱 Platform:', Platform.OS);
                console.log('🌐 Web Client ID:', webClientId);
                console.log('🍎 iOS Client ID:', iosClientId);
                
                // Check if we have the required client ID for current platform
                if (Platform.OS === 'ios' && !iosClientId) {
                    console.error('❌ iOS Client ID missing for Google Sign-In');
                    Alert.alert(
                        'Configuration Error', 
                        'iOS Client ID is missing for Google Sign-In. Please contact support.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
                
                if (Platform.OS === 'android' && !webClientId) {
                    console.error('❌ Web Client ID missing for Google Sign-In');
                    Alert.alert(
                        'Configuration Error', 
                        'Web Client ID is missing for Google Sign-In. Please contact support.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
                
                const googleConfig = Platform.OS === 'ios' 
                    ? { iosClientId } 
                    : { webClientId };
                
                console.log('⚙️ Google Config:', googleConfig);
                configureGoogleSignIn(googleConfig);
                setIsConfigured(true);
                console.log('✅ Google Sign-In configured successfully');
                
            } catch (error) {
                console.error('❌ Failed to configure Google Sign-In:', error);
                Alert.alert('Error', 'Failed to configure Google Sign-In');
            }
        };
        
        if (feature && !isConfigured) {
            configureGoogle();
        }
    }, [feature, isConfigured]);
    const handleLogin = async () => {
        if (loading || disabled || !isConfigured) {
            if (!isConfigured) {
                Alert.alert('Error', 'Google Sign-In is not properly configured. Please try again.');
            }
            return;
        }
        
        try {
            console.log('🚀 Starting Google login process');
            console.log('📋 Feature data:', feature);
            
            const state = feature.state ?? (feature?.urlLink?.split('state=')[1]?.split('&')[0] || '');
            console.log('🔑 State parameter:', state);
            
            if (!state) {
                throw new Error('State parameter is missing from feature configuration');
            }
            
            setLoading(true);
            console.log('🔐 Attempting Google Sign-In...');
            
            const googleLoginResult: any = await login('google');
            console.log('✅ Google login result:', googleLoginResult);
            
            if (!googleLoginResult?.accessToken) {
                throw new Error('No access token received from Google Sign-In');
            }
            
            console.log('🔄 Converting to proxy auth token...');
            const proxyResponse = await FeatureApis.getProxyAuthTokenForGoogleAuth(state, googleLoginResult.accessToken);
            console.log('✅ Proxy response:', proxyResponse);
            
            onLoginSuccess && onLoginSuccess(proxyResponse);
        } catch (error: any) {
            console.error('❌ Google login failed:', error);
            
            // Provide user-friendly error messages
            let errorMessage = 'Google Sign-In failed. Please try again.';
            
            if (error.message?.includes('DEVELOPER_ERROR')) {
                errorMessage = 'Google Sign-In configuration error. Please contact support.';
            } else if (error.message?.includes('SIGN_IN_CANCELLED')) {
                errorMessage = 'Sign-in was cancelled.';
            } else if (error.message?.includes('NETWORK_ERROR')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            Alert.alert('Sign-In Error', errorMessage);
            onLoginFailure && onLoginFailure(error);
        } finally {
            setLoading(false);
        }
    };
    return <TouchableOpacity
        style={[styles.button, buttonStyle, disabled && styles.disabled]}
        onPress={handleLogin}
        disabled={disabled || loading}
    >
        {loading ? (
            <ActivityIndicator color={loadingColor} />
        ) : (
            <View style={styles.buttonContent}>
                <Image source={{ uri: GOOGLE_LOGO }} style={styles.logo} />
                <Text style={[styles.text, textStyle]}>{buttonText || 'Continue with Google'}</Text>
            </View>

        )}
    </TouchableOpacity>
}


const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.7,
    },
    logo: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    text: {
        color: '#757575',
        fontSize: 16,
        fontWeight: '600',
    },
});