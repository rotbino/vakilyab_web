// lib/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/lib/types';

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    _persist?: any;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        // اضافه اکشن برای به‌روزرسانی timeSlots
        updateTimeSlots: (state, action: PayloadAction<{ lawyerId: string; timeSlots: any[] }>) => {
            if (state.user && state.user.id === action.payload.lawyerId) {
                state.user = {
                    ...state.user,
                    timeSlots: action.payload.timeSlots
                };
            }
        },
        // اضافه اکشن برای به‌روزرسانی weeklyTemplate
        updateWeeklyTemplate: (state, action: PayloadAction<{ lawyerId: string; weeklyTemplate: any }>) => {
            if (state.user && state.user.id === action.payload.lawyerId) {
                state.user = {
                    ...state.user,
                    weeklyTemplate: action.payload.weeklyTemplate
                };
            }
        },
        resetPersist: (state) => {
            state._persist = undefined;
        }
    },
});

export const { setUser, logout, setLoading, updateTimeSlots, updateWeeklyTemplate, resetPersist } = authSlice.actions;
export default authSlice.reducer;