// lib/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage'; // فایل storage که ساختید
import authReducer from './slices/authSlice';

// پیکربندی persist برای auth slice
const persistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated'] // فقط این دو فیلد را ذخیره کن
};

// ایجاد reducer با قابلیت persist
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;