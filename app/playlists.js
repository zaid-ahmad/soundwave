import { useState, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import { useRouter } from "expo-router";

export default function PlaylistsScreen() {
    const { tokens } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const spotifyApi = createSpotifyApi(tokens.accessToken);
    const router = useRouter();

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        try {
            const response = await spotifyApi.getUserPlaylists();
            setPlaylists(response.data.items);
        } catch (error) {
            console.error("Failed to load playlists:", error);
        }
    };

    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity style={styles.playlistItem}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.playlistTrackCount}>
                {item.tracks.total} tracks
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/create-playlist")}
            >
                <Text style={styles.createButtonText}>Create New Playlist</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    playlistItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#282828",
    },
    playlistName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    playlistTrackCount: {
        color: "#b3b3b3",
        fontSize: 14,
        marginTop: 4,
    },
    createButton: {
        backgroundColor: "#1DB954",
        margin: 15,
        padding: 15,
        borderRadius: 25,
        alignItems: "center",
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
