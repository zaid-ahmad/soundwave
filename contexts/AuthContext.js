import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect } from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import {
    exchangeCodeForToken,
    refreshAccessToken,
    SPOTIFY_CLIENT_ID,
} from "../services/spotifyAuth";

const AuthContext = createContext({});

const TOKEN_STORAGE_KEY = "@spotify_tokens";

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokens, setTokens] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load tokens from storage on app start
    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = async () => {
        try {
            const storedTokens = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
            if (storedTokens) {
                const parsedTokens = JSON.parse(storedTokens);
                setTokens(parsedTokens);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Failed to load tokens:", error);
        } finally {
            setLoading(false);
        }
    };

    // Save tokens whenever they change
    const saveTokens = async (newTokens) => {
        try {
            await AsyncStorage.setItem(
                TOKEN_STORAGE_KEY,
                JSON.stringify(newTokens)
            );
            setTokens(newTokens);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to save tokens:", error);
        }
    };

    const login = async () => {
        try {
            const redirectUri = makeRedirectUri({
                scheme: "your-scheme",
                path: "spotify-auth-callback",
            });

            const state = Math.random().toString(36).substring(7);
            const scopes =
                "user-library-read playlist-read-private playlist-modify-public playlist-modify-private user-read-playback-state user-modify-playback-state";

            const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
                redirectUri
            )}&scope=${encodeURIComponent(scopes)}&state=${state}`;

            await WebBrowser.warmUpAsync();
            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUri
            );
            await WebBrowser.coolDownAsync();

            if (result.type === "success") {
                const code = result.url.match(/code=([^&]*)/)?.[1];
                if (!code) throw new Error("No code received");

                const tokenResponse = await exchangeCodeForToken(
                    code,
                    redirectUri
                );
                await saveTokens(tokenResponse);
                router.replace("/home");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
            setTokens(null);
            setIsAuthenticated(false);
            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const refreshToken = async () => {
        if (!tokens?.refreshToken) return;

        try {
            const newTokens = await refreshAccessToken(tokens.refreshToken);
            await saveTokens(newTokens);
        } catch (error) {
            console.error("Token refresh error:", error);
            logout();
        }
    };

    useEffect(() => {
        if (tokens?.accessToken) {
            const refreshInterval = setInterval(refreshToken, 3000000); // 50 minutes
            return () => clearInterval(refreshInterval);
        }
    }, [tokens]);

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                tokens,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
