import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";

export default function TrackItem({ track, onPress }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image
                source={{ uri: track.album.images[0]?.url }}
                style={styles.artwork}
            />
            <View style={styles.info}>
                <Text style={styles.title}>{track.name}</Text>
                <Text style={styles.artist}>
                    {track.artists.map((artist) => artist.name).join(", ")}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#282828",
    },
    artwork: {
        width: 50,
        height: 50,
        borderRadius: 4,
    },
    info: {
        marginLeft: 10,
        flex: 1,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    artist: {
        color: "#b3b3b3",
        fontSize: 14,
    },
});
