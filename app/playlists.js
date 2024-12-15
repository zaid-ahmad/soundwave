import { useState, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import { useRouter } from "expo-router";
import PlaylistDetails from "../components/PlaylistDetails";
import AddToPlaylist from "../components/AddToPlaylist";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PlaylistsScreen() {
    const { tokens } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showAddTracks, setShowAddTracks] = useState(false);
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
        <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => setSelectedPlaylist(item.id)}
        >
            <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistTrackCount}>
                    {item.tracks.total} tracks
                </Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    setSelectedPlaylist(item.id);
                    setShowAddTracks(true);
                }}
            >
                <Icon name="add" size={24} color="#1DB954" />
            </TouchableOpacity>
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

            <Modal
                visible={!!selectedPlaylist && !showAddTracks}
                animationType="slide"
                onRequestClose={() => setSelectedPlaylist(null)}
            >
                {selectedPlaylist && (
                    <PlaylistDetails
                        playlistId={selectedPlaylist}
                        onClose={() => setSelectedPlaylist(null)}
                    />
                )}
            </Modal>

            <Modal
                visible={showAddTracks}
                animationType="slide"
                onRequestClose={() => setShowAddTracks(false)}
            >
                {selectedPlaylist && (
                    <AddToPlaylist
                        playlistId={selectedPlaylist}
                        onClose={() => {
                            setShowAddTracks(false);
                            loadPlaylists();
                        }}
                    />
                )}
            </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playlistInfo: {
        flex: 1,
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
    addButton: {
        padding: 10,
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