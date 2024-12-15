import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setPlayerCollapsed, setCurrentTrack, setIsPlaying } from "../store/playerSlice";
import PlaybackControls from "./PlaybackControls";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCallback, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { createSpotifyApi } from "../services/spotifyApi";

export default function Player() {
    const { currentTrack, isPlaying } = useSelector((state) => state.player);
    const isCollapsed = useSelector((state) => state.player.isCollapsed);
    const dispatch = useDispatch();
    const { tokens } = useAuth();
    const spotifyApi = createSpotifyApi(tokens?.accessToken);

    useEffect(() => {
        const fetchCurrentTrack = async () => {
            try {
                const response = await spotifyApi.getCurrentlyPlaying();
                if (response.data && response.data.item) {
                    dispatch(setCurrentTrack(response.data.item));
                    dispatch(setIsPlaying(response.data.is_playing));
                }
            } catch (error) {
                console.error('Error fetching current track:', error);
            }
        };

        if (tokens?.accessToken) {
            fetchCurrentTrack();
            // updates every 5 seconds
            const interval = setInterval(fetchCurrentTrack, 5000);
            return () => clearInterval(interval);
        }
    }, [tokens?.accessToken]);

    const handleControlAction = async () => {
        try {
            const response = await spotifyApi.getCurrentlyPlaying();
            if (response.data && response.data.item) {
                dispatch(setCurrentTrack(response.data.item));
                dispatch(setIsPlaying(response.data.is_playing));
            }
        } catch (error) {
            console.error('Error fetching current track:', error);
        }
    };

    const toggleCollapsed = useCallback(() => {
        dispatch(setPlayerCollapsed(!isCollapsed));
    }, [isCollapsed, dispatch]);

    if (!currentTrack && !isPlaying) {
        return null;
    }

    const renderMiniPlayer = () => (
        <View style={styles.miniContentContainer}>
            {currentTrack?.album?.images[0]?.url && (
                <Image
                    source={{ uri: currentTrack.album.images[0].url }}
                    style={styles.miniArtwork}
                />
            )}
            <View style={styles.miniInfo}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                    {currentTrack?.name || 'Unknown Track'}
                </Text>
                <Text style={styles.miniArtist} numberOfLines={1}>
                    {currentTrack?.artists ?
                        currentTrack.artists.map(artist => artist.name).join(", ") :
                        'Unknown Artist'}
                </Text>
            </View>
            <TouchableOpacity
                onPress={toggleCollapsed}
                style={styles.expandButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.7}
            >
                <Icon name="expand-less" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderFullPlayer = () => (
        <>
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    onPress={toggleCollapsed}
                    style={styles.collapseButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Icon name="expand-more" size={24} color="#fff" />
                </TouchableOpacity>
                {currentTrack?.album?.images[0]?.url ? (
                    <Image
                        source={{ uri: currentTrack.album.images[0].url }}
                        style={styles.artwork}
                    />
                ) : (
                    <View style={[styles.artwork, styles.placeholderArtwork]} />
                )}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {currentTrack?.name || 'Unknown Track'}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {currentTrack?.artists ?
                            currentTrack.artists.map(artist => artist.name).join(", ") :
                            'Unknown Artist'}
                    </Text>
                </View>
            </View>
            <PlaybackControls onControlAction={handleControlAction} />
        </>
    );

    return (
        <View style={[
            styles.container,
            isCollapsed ? styles.miniContainer : styles.fullContainer
        ]}>
            {isCollapsed ? renderMiniPlayer() : renderFullPlayer()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#282828",
        borderTopWidth: 1,
        borderTopColor: "#121212",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    miniContainer: {
        height: Platform.OS === 'ios' ? 64 : 56,
    },
    fullContainer: {
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    miniContentContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        height: '100%',
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        minHeight: 48,
        position: 'relative',
    },
    artwork: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    miniArtwork: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    placeholderArtwork: {
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    miniInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    title: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    miniTitle: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    artist: {
        color: "#b3b3b3",
        fontSize: 12,
        marginTop: 2,
    },
    miniArtist: {
        color: "#b3b3b3",
        fontSize: 11,
    },
    collapseButton: {
        position: 'absolute',
        right: 12,
        top: 0,
        padding: 8,
        zIndex: 2,
    },
    expandButton: {
        padding: 8,
    }
});