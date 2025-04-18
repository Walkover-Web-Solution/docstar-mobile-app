import { createStackNavigator } from '@react-navigation/stack';
import ChatBot from 'chatbot-react-native-sdk';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PageHtmlRenderer from '../components/pageHtmlRenderer';
import SearchOverlay from '../components/searchOverlay';
import { useAppSelector } from '../hooks/hooks';
import AllCollections from '../screens/allCollection';
import AllPages from '../screens/allPages';
import { withSafeArea } from '../hoc/safeAreaHoc';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [showSearch, setShowSearch] = useState(false);

    const { currentOrgId } = useAppSelector((state) => ({
        currentOrgId: state.userInfo.currentOrgId,
    }));

    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator>
                <Stack.Screen name="CollectionsList" component={AllCollections} options={{ headerShown: false }} />
                <Stack.Screen name="PageList" component={AllPages} options={{ headerShown: true }} />
                <Stack.Screen name="PageDetail" component={PageHtmlRenderer} options={{ headerShown: true }} />
            </Stack.Navigator>

            <ChatBot
                embedToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiJydWRyYWtzaCJ9.u_X4bOonyrCPIEZGJojq9CXxxEkuDdsTPSJ4pcH7oBU"
                threadId={String(currentOrgId)}
                bridgeName="techdoc_internal_chatbot"
                variables={{}}
                openInContainer={false}
                hideIcon={false}
                defaultOpen={false}
                hideCloseButton={false}
            />

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setShowSearch(true)}
            >
                <MaterialIcons name="search" size={22} color="#fff" />
            </TouchableOpacity>

            {showSearch && (
                <SearchOverlay onClose={() => setShowSearch(false)} />
            )}
        </View>
    );
};

export default AppNavigator;

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#007AFF',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 5,
    },
});