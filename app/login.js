import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function LoginScreen() {
    const { login } = useAuth();
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        console.log("hi");
        try {
            setError(null);
            await login();
        } catch (err) {
            setError("Failed to login with Spotify. Please try again.");
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
                resizeMode='contain'
            />
            <Text style={styles.title}>Welcome to SoundWave</Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginText}>Login with Spotify</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        color: "#fff",
        marginBottom: 30,
        fontWeight: "bold",
    },
    loginButton: {
        backgroundColor: "#1DB954",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    loginText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    errorText: {
        color: "#f00",
        marginTop: 20,
    },
});
