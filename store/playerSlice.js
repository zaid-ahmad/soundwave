import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentTrack: null,
    isPlaying: false,
    queue: [],
};

const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {
        setCurrentTrack: (state, action) => {
            state.currentTrack = action.payload;
        },
        setIsPlaying: (state, action) => {
            state.isPlaying = action.payload;
        },
        setQueue: (state, action) => {
            state.queue = action.payload;
        },
        addToQueue: (state, action) => {
            state.queue.push(action.payload);
        },
    },
});

export const { setCurrentTrack, setIsPlaying, setQueue, addToQueue } =
    playerSlice.actions;
export default playerSlice.reducer;
