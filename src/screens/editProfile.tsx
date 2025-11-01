import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    AppState,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { useGetUserQuery, useUpdateUserProfileMutation } from '../redux/services/apis/userApi';
import { setUserInfo } from '../redux/features/userInfo/userInfoSlice';

// Define navigation type
type RootStackParamList = {
    'Select Workspace': undefined;
    'EditProfile': undefined;
};

type EditProfileNavigationProp = NavigationProp<RootStackParamList>;

const EditProfile = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<EditProfileNavigationProp>();
    const userInfo = useAppSelector((state: any) => state.userInfo);
    
    // Fresh data from API with polling for real-time sync
    const { data: profileData, isLoading: profileLoading, error: profileError, refetch } = useGetUserQuery(undefined, {
        pollingInterval: 30000, // Poll every 30 seconds
        refetchOnFocus: true,   // Refetch when window/app gets focus
        refetchOnReconnect: true // Refetch when network reconnects
    });
    
    // Update User API
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);

    // Update form when API data loads
    useEffect(() => {
        // Priority 1: API data
        if (profileData) {
            setName(profileData.name || '');
            setEmail(profileData.email || '');
        }
        // Priority 2: Redux fallback data
        else if (userInfo && !profileLoading) {
            setName(userInfo.name || '');
            setEmail(userInfo.email || '');
        }
    }, [profileData, userInfo, profileLoading]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Listen for app state changes (foreground/background)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                console.log('🔄 App came to foreground - refreshing profile data');
                refetch();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        return () => subscription?.remove();
    }, [refetch]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        // Only send name for update (email is read-only)
        const userData = {
            name: name.trim()
        };

        try {
            setIsLoading(true);
            
            // Optimistic update - update Redux state immediately
            dispatch(setUserInfo({ 
                ...userInfo, 
                name: userData.name 
            }));
            
            // Call real API
            const result = await updateUser(userData).unwrap();
            
            // Refetch latest data from server
            await refetch();

            Alert.alert(
                'Success',
                'Profile updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            console.error('❌ Error updating profile:', error);
            
            // Revert optimistic update on error
            dispatch(setUserInfo(userInfo));
            
            // Parse API error messages
            let errorMessage = 'Failed to update profile. Please try again.';
            
            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            Alert.alert(
                'Update Notice', 
                `Your changes have been saved locally. ${errorMessage}`,
                [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state while fetching profile data
    if (profileLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading your profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state if profile data fails to load
    if (profileError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>❌ Could not load profile data</Text>
                    <Text style={styles.errorSubText}>Please check your connection and try again</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    onPress={() => {
                        // Check if we can go back in navigation stack
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('Select Workspace');
                        }
                    }}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    onPress={() => {
                        refetch();
                    }}
                    disabled={profileLoading || isUpdating}
                >
                    <Text style={[styles.refreshButtonText, (profileLoading || isUpdating) && styles.refreshButtonDisabled]}>
                        ↻
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        editable={!isLoading && !isUpdating}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, styles.readOnlyLabel]}>Email </Text>
                    <TextInput
                        style={[styles.input, styles.readOnlyInput]}
                        value={email}
                        placeholder="Email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={false}
                        selectTextOnFocus={false}
                    />
                </View>


                <TouchableOpacity
                    style={[styles.saveButton, (isLoading || isUpdating) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading || isUpdating}
                >
                    {(isLoading || isUpdating) ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Update Profile</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    refreshButton: {
        marginLeft: 16,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButtonText: {
        fontSize: 20,
        color: '#007AFF',
    },
    refreshButtonDisabled: {
        color: '#ccc',
    },
    form: {
        padding: 20,
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    readOnlyLabel: {
        color: '#6c757d',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    readOnlyInput: {
        backgroundColor: '#f8f9fa',
        borderColor: '#e9ecef',
        color: '#6c757d',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Loading state styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    // Error state styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#e74c3c',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    errorSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditProfile;
