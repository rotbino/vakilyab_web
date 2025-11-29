'use client';

import React, { useState, useMemo } from 'react';
import LawyerCard from '@/app/lawyers/LawyerCard';
import { LawyerList as LawyerListType } from '@/lib/api/types';
import { Checkbox } from '@/components/radix/checkbox';
import { Wifi, Search, Filter } from 'lucide-react';
import { useLawyers } from '@/lib/api/useApi';
import { Input } from '@/components/radix/input';
import { Button } from '@/components/radix/button';

interface LawyersListProps {
    initialLawyers?: LawyerListType[];
    title?: string;
    showViewAllButton?: boolean;
    viewAllLink?: string;
    limit?: number;
    showOnlineFilter?: boolean;
    showSearch?: boolean;
    filters?: {
        specialty?: string;
        province?: string;
        city?: string;
        includeVIP?: boolean;
    };
}

export default function LawyersList({
                                        initialLawyers = [],
                                        title = "لیست وکلا",
                                        showViewAllButton = false,
                                        viewAllLink = "/lawyers",
                                        limit,
                                        showOnlineFilter = true,
                                        showSearch = false,
                                        filters = {}
                                    }: LawyersListProps) {
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // استفاده از هوک برای دریافت داده‌ها
    const { data: lawyers, isLoading, error, refetch } = useLawyers(filters);

    // محاسبه لیست فیلتر شده با useMemo برای جلوگیری از رندرهای اضافی
    const filteredLawyers = useMemo(() => {
        let result = lawyers || initialLawyers;

        // اعمال محدودیت تعداد در صورت نیاز
        if (limit) {
            result = result.slice(0, limit);
        }

        // فیلتر کردن بر اساس عبارت جستجو
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lawyer =>
                lawyer.name.toLowerCase().includes(term) ||
                lawyer.lastName.toLowerCase().includes(term) ||
                lawyer.specialty.toLowerCase().includes(term) ||
                (lawyer.username && lawyer.username.toLowerCase().includes(term))
            );
        }

        // فیلتر کردن وکلای آنلاین اگر چک‌باکس فعال باشد
        if (showOnlineOnly) {
            result = result.filter(lawyer => lawyer.isOnline);
        }

        return result;
    }, [lawyers, initialLawyers, searchTerm, showOnlineOnly, limit]);

    // نمایش وضعیت لودینگ
    if (isLoading) {
        return (
            <div className="my-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // نمایش وضعیت خطا
    if (error) {
        return (
            <div className="my-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-red-500 mb-4">
                        <Filter className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                    <p className="text-gray-600 mb-4">
                        خطا در بارگذاری لیست وکلا. لطفاً صفحه را رفرش کنید.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => refetch()} className="bg-[#ca2a30] hover:bg-[#b02529]">
                            تلاش مجدد
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            رفرش صفحه
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

                <div className="flex items-center gap-4">
                    {showSearch && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="جستجوی نام، تخصص یا نام کاربری..."
                                className="pl-10 w-64 h-10 border-gray-300 focus:border-[#ca2a30] focus:ring-[#ca2a30]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}

                    {showOnlineFilter && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="online-filter"
                                checked={showOnlineOnly}
                                onCheckedChange={(checked) => setShowOnlineOnly(checked as boolean)}
                                className="data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700"
                            />
                            <label
                                htmlFor="online-filter"
                                className="flex items-center gap-1 text-sm font-medium cursor-pointer text-gray-700"
                            >
                                <Wifi className="w-4 h-4 text-green-500" />
                                فقط آنلاین‌ها
                            </label>
                        </div>
                    )}

                    {showViewAllButton && (
                        <a href={viewAllLink} className="text-red-800 font-medium whitespace-nowrap">
                            مشاهده همه
                        </a>
                    )}
                </div>
            </div>

            {/* Lawyers Grid */}
            {filteredLawyers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLawyers.map(lawyer => (
                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {showOnlineOnly ? "وکیل آنلاینی یافت نشد" : "وکیلی یافت نشد"}
                    </h3>
                    <p className="text-gray-600">
                        {showOnlineOnly
                            ? "در حال حاضر هیچ وکیلی آنلاین نیست. لطفاً بعداً دوباره بررسی کنید یا فیلتر آنلاین را غیرفعال کنید."
                            : searchTerm
                                ? "با عبارت جستجوی دیگری دوباره تلاش کنید"
                                : "با تغییر فیلترها دوباره تلاش کنید"
                        }
                    </p>
                    {showOnlineOnly && (
                        <button
                            onClick={() => setShowOnlineOnly(false)}
                            className="mt-4 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
                        >
                            نمایش همه وکلا
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}