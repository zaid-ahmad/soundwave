import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackList from "./TrackList";

export default function PlaylistTracks({
                                           playlist,
                                           tracks,
                                           totalTracks,
                                           onTrackPress,
                                           onLoadMore,
                                           isLoadingMore
                                       }) {
    if (!playlist) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    if (!tracks || tracks.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="queue-music" size={48} color="#1DB954" />
                <Text style={styles.emptyText}>No tracks in this playlist</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <Icon name="queue-music" size={24} color="#1DB954" />
            <Text style={styles.headerText}>{playlist?.name || 'Loading...'}</Text>
            <Text style={styles.songCount}>
                {totalTracks.toLocaleString()} songs
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    };

    return (
        <TrackList
            tracks={tracks}
            onTrackPress={onTrackPress}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
        />
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#282828',
        borderRadius: 8,
        margin: 10,
    },
    headerText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    songCount: {
        color: '#B3B3B3',
        fontSize: 14,
        marginLeft: 'auto',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#B3B3B3',
        fontSize: 16,
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});