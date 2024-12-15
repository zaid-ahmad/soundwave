import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { View, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store";
import { StatusBar } from "expo-status-bar";
import Player from "../components/Player";
import { useSelector } from "react-redux";
import "react-native-gesture-handler";

function StackLayout() {
    const { isAuthenticated } = useAuth();
    const currentTrack = useSelector((state) => state.player.currentTrack);
    const isPlayerCollapsed = useSelector((state) => state.player.isCollapsed);

    return (
        <View style={styles.container}>
            <View style={[
                styles.contentContainer,
                currentTrack && (isPlayerCollapsed ? styles.withMiniPlayer : styles.withFullPlayer)
            ]}>
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: "#1DB954" },
                        headerTintColor: "#fff",
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            headerShown: false,
                            href: isAuthenticated ? "/home" : "/login",
                        }}
                    />
                    <Stack.Screen
                        name="login"
                        options={{
                            headerShown: false,
                            href: isAuthenticated ? "/home" : null,
                        }}
                    />
                    <Stack.Screen
                        name="home"
                        options={{
                            title: "SoundWave",
                            href: !isAuthenticated ? "/login" : null,
                        }}
                    />
                    <Stack.Screen
                        name="playlists"
                        options={{
                            title: "Your Playlists",
                            href: !isAuthenticated ? "/login" : null,
                        }}
                    />
                    <Stack.Screen
                        name="search"
                        options={{
                            title: "Search",
                            href: !isAuthenticated ? "/login" : null,
                        }}
                    />
                </Stack>
            </View>
            <Player />
        </View>
    );
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <StatusBar style="light" />
                <StackLayout />
            </AuthProvider>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        transition: 'padding-bottom 0.3s ease',
    },
    withMiniPlayer: {
        paddingBottom: 56,
    },
    withFullPlayer: {
        paddingBottom: 120,
    },
});