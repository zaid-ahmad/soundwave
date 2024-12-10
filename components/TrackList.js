import { FlatList, StyleSheet } from "react-native";
import TrackItem from "./TrackItem";

export default function TrackList({ tracks, onTrackPress }) {
    return (
        <FlatList
            data={tracks}
            renderItem={({ item }) => (
                <TrackItem track={item} onPress={() => onTrackPress(item)} />
            )}
            keyExtractor={(item) => item.id}
            style={styles.list}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: "#121212",
    },
});
