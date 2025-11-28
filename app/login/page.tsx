// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Label } from '@/components/radix/label';
import { useAuth } from '@/lib/api/useApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {clearAndInitializeLocalStorage} from "@/lib/api/mockData";
import {router} from "next/client";


export default function LoginPage() {
    const [mobile, setMobile] = useState('09196421264');
    const [password, setPassword] = useState('1111');
    const [error, setError] = useState('');
    const { login, isLoading, error: authError } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data=await login({ mobile, password });
            if (data.user.role === 'lawyer') {
                router.push('/lawyer-dashboard');
            } else {
                router.push('/user-dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'شماره همراه یا رمز عبور اشتباه است');
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-orange-600">
                        ورود به وکیل‌یاب
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(error || authError) && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                            {error || authError?.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">شماره همراه</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="09123456789"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">رمز عبور</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'در حال ورود...' : 'ورود'}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            حساب کاربری ندارید؟{' '}
                            <Link href="/register" className="text-orange-600 hover:underline">
                                ثبت‌نام کنید
                            </Link>
                        </div>
                    </form>

                    {/* افزودن دکمه پاک کردن localStorage */}
                    <ClearLocalStorageButton />
                </CardContent>
            </Card>
        </div>
    );
}

// app/components/ClearLocalStorageButton.tsx
 const ClearLocalStorageButton = () => {
    const handleClearData = () => {
        if (confirm('آیا از پاک کردن داده‌های ذخیره شده اطمینان دارید؟')) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Clearing localStorage...');
            }

            clearAndInitializeLocalStorage();
        }
    };

    // فقط در محیط توسعه نمایش داده شود
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <Button
            variant="outline"
            onClick={handleClearData}
            className="w-full mt-4 text-sm bg-gray-200"
        >
            پاک کردن داده‌های ذخیره شده (توسعه)
        </Button>
    );
};