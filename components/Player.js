import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setIsPlaying } from "../store/playerSlice";
import { createSpotifyApi } from "../services/spotifyApi";
import { useAuth } from "../contexts/AuthContext";

export default function Player() {
    const { tokens } = useAuth();
    const dispatch = useDispatch();
    const { currentTrack, isPlaying } = useSelector((state) => state.player);
    const spotifyApi = createSpotifyApi(tokens.accessToken);

    const togglePlayback = async () => {
        try {
            if (isPlaying) {
                await spotifyApi.pausePlayback();
            } else {
                await spotifyApi.startPlayback(null, [currentTrack.uri]);
            }
            dispatch(setIsPlaying(!isPlaying));
        } catch (error) {
            console.error("Playback toggle error:", error);
        }
    };

    if (!currentTrack) return null;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: currentTrack.album.images[0]?.url }}
                style={styles.artwork}
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {currentTrack.name}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {currentTrack.artists
                        .map((artist) => artist.name)
                        .join(", ")}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.playButton}
                onPress={togglePlayback}
            >
                <Text style={styles.playButtonText}>
                    {isPlaying ? "⏸️" : "▶️"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#282828",
        borderTopWidth: 1,
        borderTopColor: "#121212",
    },
    artwork: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginHorizontal: 10,
    },
    title: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    artist: {
        color: "#b3b3b3",
        fontSize: 12,
    },
    playButton: {
        padding: 10,
    },
    playButtonText: {
        fontSize: 24,
    },
});
