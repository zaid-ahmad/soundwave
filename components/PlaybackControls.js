import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from "react-redux";
import { setIsPlaying } from "../store/playerSlice";
import { createSpotifyApi } from "../services/spotifyApi";
import { useAuth } from "../contexts/AuthContext";

export default function PlaybackControls({ onControlAction }) {
    const { tokens } = useAuth();
    const dispatch = useDispatch();
    const { isPlaying, currentTrack } = useSelector((state) => state.player);
    const spotifyApi = createSpotifyApi(tokens.accessToken);

    const getActiveDevice = async () => {
        try {
            const devices = await spotifyApi.getDevices();
            const activeDevice = devices.data.devices.find(device => device.is_active);
            return activeDevice;
        } catch (error) {
            console.error("Error getting active device:", error);
            return null;
        }
    };

    const handlePlayPause = async () => {
        try {
            if (isPlaying) {
                await spotifyApi.pausePlayback();
            } else {
                const activeDevice = await getActiveDevice();
                if (activeDevice) {
                    const playbackState = await spotifyApi.getRecentlyPlayedContext();
                    if (playbackState.data?.context) {
                        await spotifyApi.startPlayback(
                            activeDevice.id,
                            null,
                            playbackState.data.context.uri
                        );
                    } else {
                        // fall back to playing the current track
                        await spotifyApi.startPlayback(
                            activeDevice.id,
                            currentTrack ? [currentTrack.uri] : null
                        );
                    }
                }
            }
            dispatch(setIsPlaying(!isPlaying));
            if (onControlAction) {
                onControlAction();
            }
        } catch (error) {
            console.error("Playback control error:", error);
        }
    };

    const handlePrevious = async () => {
        try {
            const activeDevice = await getActiveDevice();
            if (activeDevice) {
                const playbackState = await spotifyApi.getRecentlyPlayedContext();

                await spotifyApi.skipToPrevious(activeDevice.id);

                if (!playbackState.data?.context) {
                    const currentIndex = playbackState.data?.item?.track_number;
                    if (currentIndex > 1) {
                        await spotifyApi.startPlayback(
                            activeDevice.id,
                            null,
                            playbackState.data?.item?.album?.uri,
                            { position: currentIndex - 2 }
                        );
                    }
                }

                if (onControlAction) {
                    setTimeout(onControlAction, 300);
                }
            }
        } catch (error) {
            console.error("Skip to previous error:", error);
        }
    };

    const handleNext = async () => {
        try {
            const activeDevice = await getActiveDevice();
            if (activeDevice) {
                const playbackState = await spotifyApi.getRecentlyPlayedContext();

                await spotifyApi.skipToNext(activeDevice.id);

                if (!playbackState.data?.context) {
                    const currentIndex = playbackState.data?.item?.track_number;
                    const totalTracks = playbackState.data?.item?.album?.total_tracks;
                    if (currentIndex < totalTracks) {
                        await spotifyApi.startPlayback(
                            activeDevice.id,
                            null,
                            playbackState.data?.item?.album?.uri,
                            { position: currentIndex }
                        );
                    }
                }

                if (onControlAction) {
                    setTimeout(onControlAction, 300);
                }
            }
        } catch (error) {
            console.error("Skip to next error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
                <Icon name="skip-previous" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
                <Icon
                    name={isPlaying ? "pause-circle-filled" : "play-circle-filled"}
                    size={44}
                    color="#1DB954"
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
                <Icon name="skip-next" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'transparent',
    },
    controlButton: {
        padding: 8,
    },
    playPauseButton: {
        paddingHorizontal: 8,
        marginHorizontal: 16,
    },
});