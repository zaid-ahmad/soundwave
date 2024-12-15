import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PlaylistSelector({ playlists, selectedId, onSelect }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <TouchableOpacity
                style={[
                    styles.option,
                    selectedId === 'liked' && styles.selectedOption
                ]}
                onPress={() => onSelect('liked')}
            >
                <Icon
                    name="favorite"
                    size={20}
                    color={selectedId === 'liked' ? '#fff' : '#1DB954'}
                />
                <Text style={[
                    styles.optionText,
                    selectedId === 'liked' && styles.selectedText
                ]}>
                    Liked Songs
                </Text>
            </TouchableOpacity>

            {playlists.map(playlist => (
                <TouchableOpacity
                    key={playlist.id}
                    style={[
                        styles.option,
                        selectedId === playlist.id && styles.selectedOption
                    ]}
                    onPress={() => onSelect(playlist.id)}
                >
                    <Icon
                        name="queue-music"
                        size={20}
                        color={selectedId === playlist.id ? '#fff' : '#1DB954'}
                    />
                    <Text style={[
                        styles.optionText,
                        selectedId === playlist.id && styles.selectedText
                    ]}>
                        {playlist.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 55,
    },
    contentContainer: {
        padding: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    selectedOption: {
        backgroundColor: '#1DB954',
    },
    optionText: {
        color: '#1DB954',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    selectedText: {
        color: '#fff',
    },
});