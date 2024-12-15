import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackList from './TrackList';
import { useAuth } from '../contexts/AuthContext';
import { createSpotifyApi } from '../services/spotifyApi';
import CustomAlert from './CustomAlert';

export default function PlaylistDetails({ playlistId, onClose }) {
    const { tokens } = useAuth();
    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });
    const spotifyApi = createSpotifyApi(tokens.accessToken);

    useEffect(() => {
        loadPlaylistDetails();
    }, [playlistId]);

    const loadPlaylistDetails = async () => {
        try {
            const playlistResponse = await spotifyApi.getPlaylistDetails(playlistId);
            setPlaylist(playlistResponse.data);

            const tracksResponse = await spotifyApi.getPlaylistTracks(playlistId);
            setTracks(tracksResponse.data.items.map(item => item.track));
        } catch (error) {
            console.error('Failed to load playlist details:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to load playlist details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTrackPress = async (track) => {
        try {
            await spotifyApi.startPlayback(null, [track.uri]);
        } catch (error) {
            console.error('Playback error:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to play track'
            });
        }
    };

    const handleRemoveTrack = async (track) => {
        try {
            await spotifyApi.removeTracksFromPlaylist(playlistId, [track.uri]);
            setTracks(tracks.filter(t => t.id !== track.id));
        } catch (error) {
            console.error('Failed to remove track:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to remove track from playlist'
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    const renderTrackActions = (track) => (
        <TouchableOpacity
            onPress={() => handleRemoveTrack(track)}
            style={styles.removeButton}
        >
            <Icon name="remove-circle-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.playlistName}>{playlist?.name}</Text>
                <Text style={styles.playlistDescription}>
                    {playlist?.description || 'No description'}
                </Text>
                <Text style={styles.trackCount}>
                    {tracks.length} tracks
                </Text>
            </View>

            <TrackList
                tracks={tracks}
                onTrackPress={handleTrackPress}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        backgroundColor: '#282828',
    },
    playlistName: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    playlistDescription: {
        color: '#b3b3b3',
        fontSize: 14,
        marginBottom: 8,
    },
    trackCount: {
        color: '#b3b3b3',
        fontSize: 14,
    },
    removeButton: {
        padding: 10,
    },
});