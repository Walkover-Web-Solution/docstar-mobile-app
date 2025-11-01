import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/loginScreen';
import { useAppSelector } from '../hooks/hooks';
import AllWorkspace from '../screens/allWorkspace';
import EditProfile from '../screens/editProfile';
const Stack = createStackNavigator();

const AuthNavigator = () => {
    const { token, currentOrgId } = useAppSelector((state) => ({
        token: state.userInfo.proxyAuthToken || null,
        currentOrgId: state.userInfo.currentOrgId || null
    }));

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!token ? (
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : !currentOrgId ? (
                <>
                    <Stack.Screen name="Select Workspace" component={AllWorkspace} />
                    <Stack.Screen name="EditProfile" component={EditProfile} />
                </>
            ) : null}
        </Stack.Navigator>
    );
};

export default AuthNavigator;
