import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Image } from 'react-native';
import { OTPVerification } from '@msg91comm/react-native-sendotp';
import { FeatureApis } from '../apis/featureApis';
import RegistrationModal from './RegistrationModal';
import type { UserRegistrationData } from './RegistrationModal';
import type { OTPFeatureType } from '../types/features';

interface PropsType {
    referenceId: string;
    onLoginSuccess: (result: any) => void;
    onLoginFailure: (error: any) => void;
    buttonText?: string;
    buttonStyle?: object;
    textStyle?: object;
    loadingColor?: string;
    disabled?: boolean;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    feature: OTPFeatureType;
}

export default function OTPLoginButton(props: PropsType) {
    
    const { 
        loading, 
        disabled, 
        feature, 
        setLoading, 
        onLoginSuccess, 
        onLoginFailure, 
        buttonStyle, 
        loadingColor, 
        textStyle
    } = props;
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [widgetId, setWidgetId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [pendingLoginData, setPendingLoginData] = useState<any>(null);

    // Check if user needs registration based on API response
    const isNewUser = (data: any): boolean => {
    
        const hasToken = data?.data?.proxy_auth_token || data?.proxy_auth_token;
        
        
        return !hasToken;
        //return true
    };

    const handleOTPLogin = async () => {
        if (loading || disabled) return;
        
        try {
            console.log('🔧 OTP Login clicked, feature:', feature);
            
            // Use feature data directly instead of API call
            if (feature?.widget_id && feature?.token_auth) {
                setWidgetId(feature.widget_id);
                setAuthToken(feature.token_auth);
                setModalVisible(true);
                
            } else {
                throw new Error('OTP feature data missing');
            }
        } catch (error: any) {
            console.error('Failed to get feature data:', error);
            onLoginFailure && onLoginFailure(error);
        }
    };

    const handleRegistrationSubmit = async (userData: UserRegistrationData) => {
        setRegistrationLoading(true);
        try {
            // TODO: Replace with actual registration API call
            console.log('📝 Registration data:', userData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Alert.alert('Success', 'Registration completed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setShowRegistrationModal(false);
                        // Continue with original login flow
                        if (pendingLoginData) {
                            onLoginSuccess(pendingLoginData);
                        }
                    }
                }
            ]);
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setRegistrationLoading(false);
        }
    };

    const handleOTPCompletion = async (data: any) => {
        try {
            setLoading(true);
            
            
            // Parse data if it's a string
            let parsedData = data;
            if (typeof data === 'string') {
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    parsedData = data;
                }
            }
            
            // Check MSG91 OTP response format: {type: "success", message: "jwt_token"}
            let isSuccess = false;
            let jwtToken = null;
            
            if (parsedData?.type?.toLowerCase() === 'success' && parsedData?.message) {
                isSuccess = true;
                jwtToken = parsedData.message; // Extract JWT token
             
                console.log('🔐 JWT Token after OTP verification:', jwtToken);
            }
            
            if (isSuccess && jwtToken) {
                // Extract state parameter from feature URL for MSG91 proxy token
                const state =  feature?.state ?? (feature?.urlLink?.split('state=')[1]?.split('&')[0] || '');
                console.log(jwtToken,"jwtoken")
                // Convert JWT token to proxy auth token using existing API
                const proxyResponse = await FeatureApis.getProxyAuthTokenForOTPAuth(state,  jwtToken);
                
                setModalVisible(false);
                
                // Check if user is new and needs registration
                if (isNewUser(proxyResponse)) {
                    console.log('📝 New user detected after OTP, showing registration form');
                    setPendingLoginData(proxyResponse);
                    setShowRegistrationModal(true);
                    return;
                }
                
                // Existing user - proceed with normal login
                onLoginSuccess && onLoginSuccess(proxyResponse);
            } else {
                throw new Error('Invalid OTP response format');
            }
        } catch (error: any) {
            console.error('OTP verification failed:', error);
            Alert.alert('Error', 'OTP verification failed. Please try again.');
            onLoginFailure && onLoginFailure(error);
        } finally {
            setLoading(false);
        }
    };



    try {
       
        return (
            <>
                <TouchableOpacity
                    style={[styles.button, buttonStyle, disabled && styles.disabled]}
                    onPress={handleOTPLogin}
                    disabled={disabled || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={loadingColor} />
                    ) : (
                        <View style={styles.buttonContent}>
                            <Image source={require('../image/msg91.png')} style={styles.icon} />
                            <Text style={[styles.text, textStyle]}>Login With OTP</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Modal visible={isModalVisible}>
                    <OTPVerification 
                        onVisible={isModalVisible}
                        onCompletion={handleOTPCompletion}
                        widgetId={widgetId}
                        authToken={authToken}
                    />
                </Modal>

                {/* Registration Modal for New Users after OTP */}
                <RegistrationModal
                    visible={showRegistrationModal}
                    onClose={() => {
                        setShowRegistrationModal(false);
                        setPendingLoginData(null);
                    }}
                    onSubmit={handleRegistrationSubmit}
                    loading={registrationLoading}
                />
            </>
        );
    } catch (error) {
        console.error('🔥 OTPLoginButton render error:', error);
        return (
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>OTP Error</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        elevation: 1,
        shadowColor: '#0000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1.5,
        borderColor: '#000000',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.7,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 12,
        resizeMode: 'contain',
    },
    text: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
});
