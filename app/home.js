import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";
import LikedSongsList from "../components/LikedSongsList";
import PlaylistTracks from "../components/PlaylistTracks";
import PlaylistSelector from "../components/PlaylistSelector";
import DeviceSelection from "../components/DeviceSelection";
import CustomAlert from "../components/CustomAlert";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setCurrentTrack, setIsPlaying } from "../store/playerSlice";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function HomeScreen() {
    const dispatch = useDispatch();
    const { tokens } = useAuth();
    const [selectedView, setSelectedView] = useState('liked');
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [totalTracks, setTotalTracks] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [activeDevice, setActiveDevice] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const spotifyApi = createSpotifyApi(tokens.accessToken);
    const router = useRouter();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedView === 'liked') {
            loadUserTracks();
        } else {
            loadPlaylistTracks(selectedView);
        }
    }, [selectedView]);

    const loadInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            loadUserPlaylists(),
            loadDevices()
        ]);
        setIsLoading(false);
    };

    const loadUserPlaylists = async () => {
        try {
            const response = await spotifyApi.getUserPlaylists();
            setPlaylists(response.data.items);
        } catch (error) {
            console.error("Failed to load playlists:", error);
        }
    };

    const loadUserTracks = async (offset = 0) => {
        try {
            setIsLoadingMore(true);
            const response = await spotifyApi.getUserSongs({ offset });

            if (offset === 0) {
                setTracks(response.items);
            } else {
                setTracks(prevTracks => [...prevTracks, ...response.items]);
            }

            setTotalTracks(response.total);
        } catch (error) {
            console.error("Failed to load tracks:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const loadPlaylistTracks = async (playlistId, offset = 0) => {
        try {
            setIsLoadingMore(true);

            // reset states when loading a new playlist
            if (offset === 0) {
                setTracks([]);
                setCurrentPlaylist(null);

                const playlistDetails = await spotifyApi.getPlaylistDetails(playlistId);
                setCurrentPlaylist(playlistDetails.data);
            }

            const response = await spotifyApi.getPlaylistTracks(playlistId);
            const formattedTracks = response.data.items.map(item => item.track).filter(track => track !== null);

            if (offset === 0) {
                setTracks(formattedTracks);
            } else {
                setTracks(prevTracks => [...prevTracks, ...formattedTracks]);
            }

            setTotalTracks(response.data.total);
        } catch (error) {
            console.error("Failed to load playlist tracks:", error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to load playlist tracks. Please try again.'
            });
        } finally {
            setIsLoadingMore(false);
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
                setShowDeviceModal(true);
                return;
            }
            await spotifyApi.startPlayback(activeDevice.id, [track.uri]);
            dispatch(setCurrentTrack(track));
            dispatch(setIsPlaying(true));
        } catch (error) {
            console.error("Playback error:", error);
            if (error.message === "No active device found") {
                setAlertConfig({
                    visible: true,
                    title: 'Playback Error',
                    message: 'Please open Spotify on a device and try again.'
                });
            } else {
                setAlertConfig({
                    visible: true,
                    title: 'Playback Error',
                    message: 'Failed to play track. Please try again.'
                });
            }
        }
    };

    const handleDeviceSelect = async (device) => {
        try {
            await spotifyApi.transferPlayback(device.id);
            setActiveDevice(device);
            setShowDeviceModal(false);
            await loadDevices();
        } catch (error) {
            console.error("Failed to switch device:", error);
            setAlertConfig({
                visible: true,
                title: 'Device Switch Error',
                message: 'Failed to switch to selected device. Please make sure the device is available.'
            });
        }
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && tracks.length < totalTracks) {
            if (selectedView === 'liked') {
                loadUserTracks(tracks.length);
            } else {
                loadPlaylistTracks(selectedView, tracks.length);
            }
        }
    };

    const refreshDevices = async () => {
        await loadDevices();
        setAlertConfig({
            visible: true,
            title: 'Devices Refreshed',
            message: 'Device list has been updated.'
        });
    };

    const toggleHeader = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsHeaderCollapsed(!isHeaderCollapsed);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={toggleHeader}
                style={styles.collapseButton}
            >
                <Icon
                    name={isHeaderCollapsed ? "expand-more" : "expand-less"}
                    size={24}
                    color="#1DB954"
                />
            </TouchableOpacity>

            {!isHeaderCollapsed && (
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

                    {activeDevice && (
                        <View style={styles.deviceButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.deviceButton]}
                                onPress={() => setShowDeviceModal(true)}
                            >
                                <View style={styles.deviceTextContainer}>
                                    <Text style={styles.buttonText}>Active Device</Text>
                                    <Text style={styles.deviceName}>{activeDevice.name}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.refreshIconButton}
                                    onPress={refreshDevices}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon name="refresh" size={20} color="#ffffff" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            <PlaylistSelector
                playlists={playlists}
                selectedId={selectedView}
                onSelect={setSelectedView}
            />

            {selectedView === 'liked' ? (
                <LikedSongsList
                    tracks={tracks}
                    totalTracks={totalTracks}
                    onTrackPress={handleTrackPress}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                />
            ) : (
                <PlaylistTracks
                    playlist={currentPlaylist}
                    tracks={tracks}
                    totalTracks={totalTracks}
                    onTrackPress={handleTrackPress}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                />
            )}

            <DeviceSelection
                visible={showDeviceModal}
                devices={devices}
                onDeviceSelect={handleDeviceSelect}
                onClose={() => setShowDeviceModal(false)}
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
        backgroundColor: "#121212",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#121212",
    },
    collapseButton: {
        alignItems: 'center',
        paddingVertical: 5,
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
    deviceButton: {
        backgroundColor: "#535353",
    },
    deviceName: {
        color: "#1DB954",
        fontWeight: "bold",
    },
    deviceButtonContainer: {
        position: 'relative',
        width: 200,
    },
    deviceTextContainer: {
        alignItems: "center",
    },
    refreshIconButton: {
        position: 'absolute',
        right: "120%",
        top: '50%',
        padding: 5,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});