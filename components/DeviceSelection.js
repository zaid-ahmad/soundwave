import { View, StyleSheet, TouchableOpacity, Text, Modal, ScrollView } from "react-native";

export default function DeviceSelection({
                                            visible,
                                            devices,
                                            onDeviceSelect,
                                            onClose
                                        }) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Device</Text>
                    <ScrollView style={styles.deviceList}>
                        {devices.map((device) => (
                            <TouchableOpacity
                                key={device.id}
                                style={[
                                    styles.deviceItem,
                                    device.is_active && styles.activeDeviceItem
                                ]}
                                onPress={() => onDeviceSelect(device)}
                            >
                                <Text style={styles.deviceName}>{device.name}</Text>
                                <Text style={styles.deviceType}>{device.type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        maxHeight: "70%",
        backgroundColor: "#282828",
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    deviceList: {
        maxHeight: 300,
    },
    deviceItem: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#404040",
    },
    activeDeviceItem: {
        backgroundColor: "#1DB954",
    },
    deviceName: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    deviceType: {
        color: "#d3d3d3",
        fontSize: 14,
        marginTop: 5,
    },
    closeButton: {
        backgroundColor: "#535353",
        padding: 15,
        borderRadius: 25,
        marginTop: 20,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});