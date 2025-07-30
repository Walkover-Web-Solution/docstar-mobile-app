import React, { useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, RefreshControl, FlatList, DeviceEventEmitter } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { useGetAllCollectionsQuery, collectionsApi } from '../redux/services/apis/collectionsApi';
import { setUserInfo } from '../redux/features/userInfo/userInfoSlice';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

function AllCollections() {
    const { currentOrgData, currentOrgId } = useAppSelector((state) => ({
        currentOrgId: state.userInfo.currentOrgId,
        currentOrgData: state.userInfo.currentOrgData,
    }));
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { data, error, isLoading, isFetching, refetch } = useGetAllCollectionsQuery(currentOrgId, {
        // Force refetch when currentOrgId changes to ensure fresh data
        refetchOnMountOrArgChange: true,
        // Skip query if no orgId is available
        skip: !currentOrgId
    });

    useEffect(() => {
        console.log('AllCollections: currentOrgId changed to:', currentOrgId);
        
        // Send data to chatbot when collections data is available
        if (data?.collectionJson && currentOrgId) {
            DeviceEventEmitter.emit('SendDataToChatbot', {
                type: 'SendDataToChatbot',
                data: {
                    variables: {
                        orgId: currentOrgId,
                        allCollections: Object.values(data?.collectionJson || {})?.map((item) => {
                            return {
                                id: item?.id,
                                name: item?.name
                            }
                        })
                    }
                }
            });
        }

        return () => {
            DeviceEventEmitter.emit('SendDataToChatbot', {
                type: 'SendDataToChatbot',
                data: {
                    variables: {
                        orgId: currentOrgId,
                        allCollections: []
                    }
                }
            });
        };
    }, [currentOrgId, data?.collectionJson]);

    const switchOrg = useCallback(() => {
        console.log('Switching organization - clearing collections cache');
        // Clear collections cache when switching org
        dispatch(collectionsApi.util.resetApiState());
        dispatch(setUserInfo({ currentOrgId: null }));
    }, [dispatch]);

    const navigateToAllPages = useCallback(
        (collectionId: string) => {
            if (collectionId) {
                dispatch(setUserInfo({ currentCollectionId: collectionId }));
                navigation.navigate('PageList', { collectionId });
            }
        },
        [dispatch, navigation]
    );

    const handleRefresh = useCallback(() => {
        console.log('Manual refresh triggered for orgId:', currentOrgId);
        // Force fresh fetch on manual refresh
        if (currentOrgId) {
            dispatch(collectionsApi.endpoints.getAllCollections.initiate(currentOrgId, { 
                forceRefetch: true,
                subscribe: false 
            }));
        }
        refetch();
    }, [currentOrgId, dispatch, refetch]);

    const renderLoading = () => (
        <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
                We encountered an issue loading collections. Please try refreshing.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    const renderOrgHeader = () => (
        <View style={styles.orgHeader}>
            <TouchableOpacity onPress={switchOrg} style={styles.orgButton}>
                <Text style={styles.orgButtonText}>
                    {currentOrgData?.name
                        ?.split(' ')
                        .map((word: string) => word[0])
                        .join('')
                        .toUpperCase()}
                </Text>
            </TouchableOpacity>
            <Text style={styles.orgNameText}>{currentOrgData?.name}</Text>
        </View>
    );

    const renderCollections = () => {
        const collections = data?.steps?.root?.map((collectionId: string) => ({
            id: collectionId,
            ...data?.collectionJson[collectionId],
        })) || [];
    
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={collections}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigateToAllPages(item.id)}
                        >
                            <Text style={styles.collectionTitle}>{item.name}</Text>
                            <Text style={styles.collectionDescription}>{item.description}</Text>
                        </TouchableOpacity>
                    )}
                    ListHeaderComponent={renderOrgHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No collections found for this workspace.</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
                />
            </SafeAreaView>
        );
    };

    // Don't render anything if no orgId is selected
    if (!currentOrgId) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.noOrgText}>Please select a workspace first.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {isLoading ? renderLoading() : error ? renderError() : renderCollections()}
        </View>
    );
}

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
    },
    noOrgText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#d9534f',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007acc',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orgHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
    },
    orgButton: {
        width: 37,
        height: 37,
        borderRadius: 10,
        backgroundColor: '#007acc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    orgButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    orgNameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    collectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    collectionDescription: {
        fontSize: 14,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    listContentContainer: {
        padding: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: '#007acc',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AllCollections;
