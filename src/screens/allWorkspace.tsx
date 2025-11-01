import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setUserInfo, clearUserInfo } from '../redux/features/userInfo/userInfoSlice';
import { useGetUserQuery, useSwitchWorkspaceMutation } from '../redux/services/apis/userApi';
import { collectionsApi } from '../redux/services/apis/collectionsApi';

export default function AllWorkspace() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { data, isLoading, isFetching, refetch } = useGetUserQuery();
    const [switchWorkspace] = useSwitchWorkspaceMutation();
    const currentOrgId = useAppSelector(state => state.userInfo.currentOrgId);
    const userInfo = useAppSelector((state: any) => state.userInfo);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleOrgSelect = async (org: any) => {
        try {
            console.log('Switching from orgId:', currentOrgId, 'to:', org.id);
            
            // Step 1: Completely reset the collections API state to clear all cached data
            dispatch(collectionsApi.util.resetApiState());
            
            // Step 2: Update Redux state with new organization
            dispatch(setUserInfo({ currentOrgId: org?.id, currentOrgData: org }));
            
            // Step 3: Switch workspace on backend
            await switchWorkspace(org.id);
            
            // Step 4: Small delay to ensure state is properly updated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Step 5: Force fresh fetch for the new workspace
            dispatch(collectionsApi.endpoints.getAllCollections.initiate(org.id, { 
                forceRefetch: true,
                subscribe: false 
            }));
            
        } catch (error) {
            console.error('Error switching workspace:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => {
                        // Close profile menu first
                        setShowProfileMenu(false);
                        
                        // Clear user info and reset app state
                        dispatch(clearUserInfo());
                        dispatch(collectionsApi.util.resetApiState());
                        console.log('User logged out successfully');
                    }
                }
            ]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    // User Avatar Component (Top-right corner)
    const renderUserAvatar = () => {
        // Use data from API call, fallback to userInfo from Redux
        const userName = data?.name || userInfo.name || 'User';
        const initials = getInitials(userName);
        
        return (
            <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => setShowProfileMenu(true)}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Dropdown Menu Component
    const renderProfileMenu = () => (
        <Modal
            visible={showProfileMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowProfileMenu(false)}
        >
            <TouchableOpacity 
                style={styles.modalOverlay}
                onPress={() => setShowProfileMenu(false)}
            >
                <View style={styles.profileMenu}>
                    {/* User Info Section */}
                    <View style={styles.userInfoSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {data?.name ? getInitials(data.name) : userInfo.name ? getInitials(userInfo.name) : 'U'}
                            </Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{data?.name || userInfo.name || 'User'}</Text>
                            <Text style={styles.userEmail}>{data?.email || userInfo.email || 'user@example.com'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.menuDivider} />
                    
                    {/* Menu Options */}
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => {
                            setShowProfileMenu(false);
                            navigation.navigate('EditProfile' as never);
                        }}
                    >
                        <MaterialIcons name="edit" size={20} color="#333" />
                        <Text style={styles.menuItemText}>Edit Profile</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleLogout}
                    >
                        <MaterialIcons name="logout" size={20} color="#f44336" />
                        <Text style={[styles.menuItemText, { color: '#f44336' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );


    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.mainContainer}>
            {/* Header with Title and User Avatar */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Select Workspace</Text>
                {renderUserAvatar()}
            </View>

            <FlatList
                contentContainerStyle={styles.container}
                data={data?.orgs || []}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => handleOrgSelect(item)}>
                        <Text style={styles.orgName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No workspaces found.</Text>}
            />
            
            {/* Profile Dropdown Menu */}
            {renderProfileMenu()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 0.2,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 16,
    },
    profileMenu: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userDetails: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 16,
        color: '#333',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logoutText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    orgName: {
        fontSize: 18,
        color: '#333'
    },
    orgId: {
        marginTop: 4,
        fontSize: 12,
        color: '#666'
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    }
});
