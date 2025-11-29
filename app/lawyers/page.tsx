'use client';

import React, { useState, useEffect } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import MobileFooter from '@/app/home/MobileFooter';
import DesktopNav from '@/app/home/DesktopNav';
import MobileNav from '@/app/home/MobileNav';
import LawyersList from '@/app/components/LawyersList';

export default function LawyersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize with empty values
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

    // Initialize state from URL params on component mount
    useEffect(() => {
        const province = searchParams.get('province') || '';
        const city = searchParams.get('city') || '';
        const specialty = searchParams.get('specialty') || '';

        setSelectedProvince(province);
        setSelectedCity(city);
        setSelectedSpecialty(specialty);
    }, [searchParams]);

    // Handle location change
    const handleLocationChange = (provinceId: string, cityName: string) => {
        setSelectedProvince(provinceId);
        setSelectedCity(cityName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-8">
            {/* Desktop Navigation */}
            <DesktopNav
                selectedProvince={selectedProvince}
                selectedCity={selectedCity}
                onLocationChange={handleLocationChange}
            />

            {/* Mobile Navigation */}
            <MobileNav
                selectedProvince={selectedProvince}
                selectedCity={selectedCity}
                onLocationChange={handleLocationChange}
            />

            <div className="max-w-7xl mx-auto px-4 pt-6">
                {/* Specialties Bar */}
                <div className="mb-6">
                    <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
                        <button
                            onClick={() => setSelectedSpecialty("")}
                            className={`flex-shrink-0 px-4 py-2 mx-2 rounded-full text-sm font-medium ${
                                selectedSpecialty === ""
                                    ? "bg-[#ca2a30] text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                            }`}
                        >
                            همه
                        </button>
                        {['حقوقی', 'خانواده', 'کیفری', 'مالیاتی', 'کار', 'تجاری', 'ملکی', 'ثبتی', 'شرکت‌ها', 'بین‌الملل'].map(specialty => (
                            <button
                                key={specialty}
                                onClick={() => setSelectedSpecialty(specialty)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                                    selectedSpecialty === specialty
                                        ? "bg-[#ca2a30] text-white"
                                        : "bg-white text-gray-700 border border-gray-300"
                                }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lawyers List */}
                <LawyersList
                    title="لیست وکلا"
                    showSearch={false}
                    filters={{
                        specialty: selectedSpecialty || undefined,
                        province: selectedProvince || undefined,
                        city: selectedCity || undefined,
                        includeVIP: true
                    }}
                />

                {/* Mobile Footer */}
                <MobileFooter />
            </div>
        </div>
    );
}