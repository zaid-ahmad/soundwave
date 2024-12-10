import axios from "axios";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const createSpotifyApi = (accessToken) => {
    const api = axios.create({
        baseURL: SPOTIFY_API_BASE_URL,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    return {
        getCurrentUser: () => api.get("/me"),

        getDevices: () => api.get("/me/player/devices"),

        startPlayback: async (deviceId, uris) => {
            try {
                await api.put(
                    `/me/player/play${
                        deviceId ? `?device_id=${deviceId}` : ""
                    }`,
                    {
                        uris,
                    }
                );
            } catch (error) {
                if (error.response?.status === 404) {
                    throw new Error("No active device found");
                }
                throw error;
            }
        },

        // Songs
        getUserSongs: (limit = 20, offset = 0) =>
            api.get(`/me/tracks?limit=${limit}&offset=${offset}`),

        // Playlists
        getUserPlaylists: (limit = 20, offset = 0) =>
            api.get(`/me/playlists?limit=${limit}&offset=${offset}`),

        createPlaylist: (userId, name, description = "", isPublic = true) =>
            api.post(`/users/${userId}/playlists`, {
                name,
                description,
                public: isPublic,
            }),

        addTracksToPlaylist: (playlistId, trackUris) =>
            api.post(`/playlists/${playlistId}/tracks`, {
                uris: trackUris,
            }),

        // Search
        searchTracks: (query, limit = 20, offset = 0) =>
            api.get(
                `/search?q=${encodeURIComponent(
                    query
                )}&type=track&limit=${limit}&offset=${offset}`
            ),

        // Playback
        startPlayback: (deviceId, uris) =>
            api.put(
                `/me/player/play${deviceId ? `?device_id=${deviceId}` : ""}`,
                {
                    uris,
                }
            ),

        pausePlayback: () => api.put("/me/player/pause"),

        skipToNext: () => api.post("/me/player/next"),

        skipToPrevious: () => api.post("/me/player/previous"),
    };
};
