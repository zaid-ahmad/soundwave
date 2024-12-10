import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import Player from "../components/Player";
import { View, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";

function StackLayout() {
    const { isAuthenticated } = useAuth();

    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: "#1DB954" },
                    headerTintColor: "#fff",
                }}
            >
                <Stack.Screen
                    name='index'
                    options={{
                        headerShown: false,
                        href: isAuthenticated ? "/home" : "/login",
                    }}
                />
                <Stack.Screen
                    name='login'
                    options={{
                        headerShown: false,
                        href: isAuthenticated ? "/home" : null,
                    }}
                />
                <Stack.Screen
                    name='home'
                    options={{
                        title: "SoundWave",
                        href: !isAuthenticated ? "/login" : null,
                    }}
                />
                <Stack.Screen
                    name='playlists'
                    options={{
                        title: "Your Playlists",
                        href: !isAuthenticated ? "/login" : null,
                    }}
                />
                <Stack.Screen
                    name='search'
                    options={{
                        title: "Search",
                        href: !isAuthenticated ? "/login" : null,
                    }}
                />
            </Stack>
            {isAuthenticated && <Player />}
        </View>
    );
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <StatusBar style='light' />
                <StackLayout />
            </AuthProvider>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
