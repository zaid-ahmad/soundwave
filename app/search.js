import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import TrackList from "../components/TrackList";

export default function SearchScreen() {
    const { tokens } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const spotifyApi = createSpotifyApi(tokens.accessToken);

    const handleSearch = async (text) => {
        setSearchQuery(text);
        if (text.trim().length > 0) {
            try {
                const response = await spotifyApi.searchTracks(text);
                setSearchResults(response.data.tracks.items);
            } catch (error) {
                console.error("Search error:", error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleTrackPress = async (track) => {
        try {
            await spotifyApi.startPlayback(null, [track.uri]);
        } catch (error) {
            console.error("Playback error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder='Search for songs...'
                placeholderTextColor='#666'
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <TrackList tracks={searchResults} onTrackPress={handleTrackPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    searchInput: {
        backgroundColor: "#282828",
        color: "#fff",
        padding: 15,
        margin: 10,
        borderRadius: 8,
        fontSize: 16,
    },
});
