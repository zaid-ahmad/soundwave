import axios from "axios";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const DEFAULT_LIMIT = 50;

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

        // Songs
        getUserSongs: async (options = {}) => {
            const {
                limit = DEFAULT_LIMIT,
                offset = 0,
                transformResponse = true
            } = options;

            const response = await api.get(`/me/tracks?limit=${limit}&offset=${offset}`);

            if (transformResponse) {
                return {
                    items: response.data.items.map(item => item.track),
                    total: response.data.total,
                    hasMore: (offset + limit) < response.data.total
                };
            }

            return response.data;
        },

        // Playlists
        getUserPlaylists: (limit = 20, offset = 0) =>
            api.get(`/me/playlists?limit=${limit}&offset=${offset}`),

        getPlaylistDetails: (playlistId) =>
            api.get(`/playlists/${playlistId}`),

        getPlaylistTracks: (playlistId, limit = 100, offset = 0) =>
            api.get(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`),

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

        removeTracksFromPlaylist: (playlistId, trackUris) =>
            api.delete(`/playlists/${playlistId}/tracks`, {
                data: {
                    tracks: trackUris.map(uri => ({ uri }))
                }
            }),

        // Search
        searchTracks: (query, limit = 20, offset = 0) =>
            api.get(
                `/search?q=${encodeURIComponent(
                    query
                )}&type=track&limit=${limit}&offset=${offset}`
            ),

        // Playback
        startPlayback: (deviceId, uris, context_uri = null, offset = null) =>
            api.put(
                `/me/player/play${deviceId ? `?device_id=${deviceId}` : ""}`,
                {
                    ...(context_uri ? { context_uri } : {}),
                    ...(uris ? { uris } : {}),
                    ...(offset ? { offset } : {})
                }
            ),

        pausePlayback: () => api.put("/me/player/pause"),

        skipToNext: (deviceId) =>
            api.post(`/me/player/next${deviceId ? `?device_id=${deviceId}` : ""}`),

        skipToPrevious: (deviceId) =>
            api.post(`/me/player/previous${deviceId ? `?device_id=${deviceId}` : ""}`),

        transferPlayback: (deviceId) =>
            api.put("/me/player", {
                device_ids: [deviceId],
                play: true
            }),

        getCurrentlyPlaying: () =>
            api.get("/me/player/currently-playing"),

        getRecentlyPlayedContext: () =>
            api.get("/me/player"),
    };
};