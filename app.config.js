import "dotenv/config";

export default {
    expo: {
        name: "soundwave",
        slug: "soundwave",
        version: "1.0.0",
        extra: {
            spotifyClientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
            spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        },
        scheme: "soundwave",
    },
};
