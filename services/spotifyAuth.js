import { Buffer } from "buffer";
import Constants from "expo-constants";

const SPOTIFY_CLIENT_ID = Constants.expoConfig.extra.spotifyClientId;
const SPOTIFY_CLIENT_SECRET = Constants.expoConfig.extra.spotifyClientSecret;

const getBasicAuthHeader = () => {
    const auth = Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");
    return `Basic ${auth}`;
};

export const exchangeCodeForToken = async (code, redirectUri) => {
    try {
        console.log(
            "Exchanging code for token with redirect URI:",
            redirectUri
        );
        console.log("Using Client ID:", SPOTIFY_CLIENT_ID); // Debug log

        const authHeader = Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64");

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }).toString(),
        });

        const data = await response.json();
        console.log("Token response:", data);

        if (!response.ok) {
            throw new Error(data.error || "Failed to exchange code for token");
        }

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    } catch (error) {
        console.error("Token exchange error:", error);
        throw error;
    }
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }).toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to refresh token");
        }

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresIn: data.expires_in,
        };
    } catch (error) {
        console.error("Refresh token error:", error);
        throw error;
    }
};

export { SPOTIFY_CLIENT_ID };
