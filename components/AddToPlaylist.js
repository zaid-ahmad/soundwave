import { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { createSpotifyApi } from '../services/spotifyApi';
import TrackList from './TrackList';
import CustomAlert from './CustomAlert';

export default function AddToPlaylist({ playlistId, onClose }) {
    const { tokens } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const spotifyApi = createSpotifyApi(tokens.accessToken);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

    const handleSearch = async (text) => {
        setSearchQuery(text);
        if (text.trim().length > 0) {
            try {
                const response = await spotifyApi.searchTracks(text);
                setSearchResults(response.data.tracks.items);
            } catch (error) {
                console.error('Search error:', error);
                setAlertConfig({
                    visible: true,
                    title: 'Error',
                    message: 'Failed to search tracks'
                });
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleAddTrack = async (track) => {
        try {
            await spotifyApi.addTracksToPlaylist(playlistId, [track.uri]);
            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'Track added to playlist'
            });
        } catch (error) {
            console.error('Failed to add track:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to add track to playlist'
            });
        }
    };

    const renderTrackActions = (track) => (
        <TouchableOpacity
            onPress={() => handleAddTrack(track)}
            style={styles.addButton}
        >
            <Icon name="add-circle-outline" size={24} color="#1DB954" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Add Tracks</Text>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Search for songs..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
            />

            <TrackList
                tracks={searchResults}
                onTrackPress={handleAddTrack}
                RightComponent={renderTrackActions}
            />
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#282828',
    },
    closeButton: {
        padding: 5,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    searchInput: {
        backgroundColor: '#282828',
        color: '#fff',
        padding: 15,
        margin: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    addButton: {
        padding: 10,
    },
});