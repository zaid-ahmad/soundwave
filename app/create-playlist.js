import { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import { useRouter } from "expo-router";

export default function CreatePlaylistScreen() {
    const router = useRouter();
    const { tokens } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const spotifyApi = createSpotifyApi(tokens.accessToken);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await spotifyApi.getCurrentUser();
            setUserId(response.data.id);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setError("Failed to load user profile");
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !userId) return;

        setLoading(true);
        setError("");

        try {
            await spotifyApi.createPlaylist(
                userId,
                name.trim(),
                description.trim()
            );
            router.replace("/playlists");
        } catch (error) {
            console.error("Create playlist error:", error);
            setError("Failed to create playlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size='large' color='#1DB954' />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder='Playlist Name'
                placeholderTextColor='#666'
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder='Description (optional)'
                placeholderTextColor='#666'
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
                style={[
                    styles.button,
                    (!name.trim() || loading) && styles.buttonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!name.trim() || loading}
            >
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text style={styles.buttonText}>Create Playlist</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 15,
        justifyContent: "center",
    },
    input: {
        backgroundColor: "#282828",
        color: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#1DB954",
        padding: 15,
        borderRadius: 25,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#1DB95480",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    errorText: {
        color: "#ff4444",
        marginBottom: 15,
        textAlign: "center",
    },
});
