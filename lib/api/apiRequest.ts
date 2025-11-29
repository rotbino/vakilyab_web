"use client";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError } from "@/lib/api/apiError";
import { store } from "@/lib/store/store";
import { setAccessToken, setSessionExpired } from "@/lib/store/slices/authSlice";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011/";

// متغیر توکن سریع
let authToken: string | null = null;

// ست کردن توکن در متغیر و redux persist
export const setAuthToken = (token: string | null) => {
    if (token) {
        authToken = token;
        store.dispatch(setAccessToken(token));
    }
};

export const getAuthToken = (): string | null => {
    authToken = authToken || store.getState().auth.accessToken;
    return authToken;
};

// axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ✅ این خط حیاتی را اضافه کنید
});

// تابع کمکی برای استخراج خطا از پاسخ سرور
const extractError = (error: any): ApiError => {
    // اگر خطا از نوع ApiError باشد، همان را برگردان
    if (error instanceof ApiError) {
        return error;
    }

    // خطاهای شبکه (عدم پاسخ از سرور)
    if (typeof error.code === "string") {
        switch (error.code) {
            case "ERR_NETWORK":
                return new ApiError(1001, "خطای شبکه یا عدم پاسخ از سرور");
            case "ECONNABORTED":
                return new ApiError(1002, "مهلت درخواست تمام شد (Timeout)");
            case "ERR_BAD_REQUEST":
                return new ApiError(400, "درخواست غیرمعتبر (Bad Request)");
            case "ERR_BAD_RESPONSE":
                return new ApiError(500, "پاسخ نامعتبر از سرور");
            case "ERR_CANCELED":
                return new ApiError(1003, "درخواست توسط کاربر یا کد لغو شد");
            default:
                return new ApiError(9999, `خطای کلاینت: ${error.code}`);
        }
    }

    // اگر سرور پاسخ داده
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // مدیریت خطاهای NestJS با ساختار استاندارد
        if (data && typeof data === 'object' && data.statusCode && data.message) {
            // اگر خطای 401 یا 403 بود، جلسه را منقضی کن
            if (data.statusCode === 401 || data.statusCode === 403) {
                store.dispatch(setSessionExpired(true));
            }

            // اگر message آرایه است، آن را به صورت رشته ترکیب کن
            let message = data.message;
            if (Array.isArray(data.message)) {
                message = data.message.join(', ');
            }

            // حفظ تمام اطلاعات خطا از سمت سرور
            return new ApiError(data.statusCode, message, {
                ...data,
                originalMessage: data.message // پیام اصلی را هم نگه می‌داریم
            });
        }

        // خطاهای HTTP استاندارد بدون ساختار NestJS
        if (status) {
            // اگر پاسخ دارای message است، از آن استفاده کن
            let message = data?.message || error.message || "خطای سرور";

            // اگر خطای 401 یا 403 بود، جلسه را منقضی کن
            if (status === 401 || status === 403) {
                store.dispatch(setSessionExpired(true));
            }

            return new ApiError(status, message, data);
        }

        // اگر هیچ‌کدام از موارد بالا نبود، از وضعیت HTTP استفاده کن
        return new ApiError(status || 0, error.message || "خطای نامعلوم", data);
    }

    // خطای ناشناخته
    return new ApiError(0, error.message || "خطای نامعلوم");
};

// متد عمومی برای درخواست‌های بدون نیاز به توکن
export const publicApiRequest = async <T = any>(
    url: string,
    options?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response: AxiosResponse<T> = await api({ url, ...options });
        return response.data;
    } catch (err: any) {
        console.error("Public API Error:", err);
        const extractErr = extractError(err);
        console.error("extractErr:", extractErr);
        throw extractErr;
    }
};

// متد اصلی برای درخواست‌ها با توکن
export const apiRequest = async <T = any>(
    url: string,
    options?: AxiosRequestConfig
): Promise<T> => {
    try {
        options = options || {};
        options.headers = options.headers || {};

        // دریافت توکن
        const token = getAuthToken();
        // اگر توکن وجود نداشت، خطا بده
        if (!token) {
            throw new ApiError(401, "توکن احراز هویت وجود ندارد");
        }

        // افزودن توکن به هدر
        options.headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<T> = await api({ url, ...options });
        return response.data;
    } catch (err: any) {
        console.error("API Error:", err);
        throw extractError(err);
    }
};

// در فایل apiRequest.ts
export const apiFileRequest = async <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig // اضافه کردن تنظیمات اختیاری Axios
): Promise<T> => {
    const token = getAuthToken();
    if (!token) {
        throw new ApiError(401, "توکن احراز هویت وجود ندارد");
    }

    let fullUrl = `${API_BASE}${url.slice(1)}`;

    console.log('Uploading to URL:', fullUrl); // برای دیباگ

    // اگر تنظیمات Axios ارائه شده باشد، از آن استفاده کن
    if (config) {
        // افزودن توکن به هدر
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
        };
        console.log(formData);
        const response = await axios.post(fullUrl, formData, config);
        return response.data;
    } else {
        // روش قبلی برای سازگاری با کدهای موجود
        const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new ApiError(response.status, errorData.message || 'Upload failed');
        }

        return await response.json();
    }
};

export default api;