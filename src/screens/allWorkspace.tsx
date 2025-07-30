import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setUserInfo } from '../redux/features/userInfo/userInfoSlice';
import { useGetUserQuery, useSwitchWorkspaceMutation } from '../redux/services/apis/userApi';
import { collectionsApi } from '../redux/services/apis/collectionsApi';

export default function AllWorkspace() {
    const dispatch = useAppDispatch();
    const { data, isLoading, isFetching, refetch } = useGetUserQuery();
    const [switchWorkspace] = useSwitchWorkspaceMutation();
    const currentOrgId = useAppSelector(state => state.userInfo.currentOrgId);

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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
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
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
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
