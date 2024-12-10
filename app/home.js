import { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import TrackList from "../components/TrackList";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const { tokens } = useAuth();
    const [tracks, setTracks] = useState([]);
    const [devices, setDevices] = useState([]);
    const [activeDevice, setActiveDevice] = useState(null);
    const spotifyApi = createSpotifyApi(tokens.accessToken);
    const router = useRouter();

    useEffect(() => {
        loadUserTracks();
        loadDevices();
    }, []);

    const loadUserTracks = async () => {
        try {
            const response = await spotifyApi.getUserSongs();
            setTracks(response.data.items.map((item) => item.track));
        } catch (error) {
            console.error("Failed to load tracks:", error);
        }
    };

    const loadDevices = async () => {
        try {
            const response = await spotifyApi.getDevices();
            setDevices(response.data.devices);
            const active = response.data.devices.find(
                (device) => device.is_active
            );
            setActiveDevice(active);
        } catch (error) {
            console.error("Failed to load devices:", error);
        }
    };

    const handleTrackPress = async (track) => {
        try {
            if (!activeDevice) {
                // If no active device, check if there are any available devices
                if (devices.length > 0) {
                    // Use the first available device
                    await spotifyApi.startPlayback(devices[0].id, [track.uri]);
                } else {
                    Alert.alert(
                        "No Device Found",
                        "Please open Spotify on a device to enable playback control."
                    );
                    return;
                }
            } else {
                await spotifyApi.startPlayback(activeDevice.id, [track.uri]);
            }
        } catch (error) {
            console.error("Playback error:", error);
            if (error.message === "No active device found") {
                Alert.alert(
                    "Playback Error",
                    "Please open Spotify on a device and try again."
                );
            } else {
                Alert.alert(
                    "Playback Error",
                    "Failed to play track. Please try again."
                );
            }
        }
    };

    const refreshDevices = () => {
        loadDevices();
        Alert.alert(
            "Refreshing Devices",
            "Please make sure Spotify is open on your device."
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/search")}
                >
                    <Text style={styles.buttonText}>Go to Search</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/playlists")}
                >
                    <Text style={styles.buttonText}>Go to Playlists</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={refreshDevices}
                >
                    <Text style={styles.buttonText}>Refresh Devices</Text>
                </TouchableOpacity>
            </View>

            {activeDevice && (
                <Text style={styles.deviceText}>
                    Active Device: {activeDevice.name}
                </Text>
            )}

            <TrackList tracks={tracks} onTrackPress={handleTrackPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    buttonContainer: {
        padding: 10,
        alignItems: "center",
    },
    button: {
        backgroundColor: "#1DB954",
        padding: 15,
        borderRadius: 25,
        marginVertical: 5,
        width: 200,
        alignItems: "center",
    },
    refreshButton: {
        backgroundColor: "#535353",
        padding: 15,
        borderRadius: 25,
        marginVertical: 5,
        width: 200,
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    deviceText: {
        color: "#fff",
        textAlign: "center",
        padding: 10,
        backgroundColor: "#282828",
    },
});
