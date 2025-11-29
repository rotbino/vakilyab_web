'use client';

import React, { useState } from 'react';
import LawyerCard from '@/app/home/LawyerCard';
import { LawyerList } from '@/lib/api/types';
import { Checkbox } from '@/components/radix/checkbox';
import { Wifi } from 'lucide-react';

interface LawyersListProps {
    lawyers: LawyerList[];
    title?: string;
    showViewAllButton?: boolean;
    viewAllLink?: string;
    limit?: number;
    showOnlineFilter?: boolean;
}

export default function LawyersList({
                                        lawyers,
                                        title = "لیست وکلا",
                                        showViewAllButton = false,
                                        viewAllLink = "/lawyers",
                                        limit,
                                        showOnlineFilter = true
                                    }: LawyersListProps) {
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // محدود کردن تعداد وکلا در صورت نیاز
    const displayedLawyers = limit ? lawyers.slice(0, limit) : lawyers;

    // فیلتر کردن وکلای آنلاین اگر چک‌باکس فعال باشد
    const filteredLawyers = showOnlineOnly
        ? displayedLawyers.filter(lawyer => lawyer.isOnline)
        : displayedLawyers;

    return (
        <div className="my-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

                <div className="flex items-center gap-4">
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
                        <a href={viewAllLink} className="text-red-800 font-medium">
                            مشاهده همه
                        </a>
                    )}
                </div>
            </div>

            {/* Lawyers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLawyers.map(lawyer => (
                    <LawyerCard key={lawyer.id} lawyer={lawyer} />
                ))}
            </div>

            {/* Empty State */}
            {filteredLawyers.length === 0 && (
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
                            : "با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید"
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