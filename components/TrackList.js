import { FlatList, StyleSheet } from "react-native";
import TrackItem from "./TrackItem";

export default function TrackList({
                                      tracks,
                                      onTrackPress,
                                      onEndReached,
                                      onEndReachedThreshold,
                                      ListHeaderComponent,
                                      ListFooterComponent,
                                      LeftComponent
                                  }) {
    return (
        <FlatList
            data={tracks}
            renderItem={({ item }) => (
                <TrackItem
                    track={item}
                    onPress={() => onTrackPress(item)}
                    LeftComponent={LeftComponent}
                />
            )}
            keyExtractor={(item) => item.id}
            style={styles.list}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold || 0.5}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: "#121212",
    },
});