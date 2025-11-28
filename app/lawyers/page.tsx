'use client';

import React, { useState, useEffect } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Input } from "@/components/radix/input";
import { Search, Filter, MapPin, Briefcase, Star, Eye, Crown } from "lucide-react";
import LawyerCard from '@/app/home/LawyerCard';

import MobileFooter from '@/app/home/MobileFooter';
import DesktopNav from '@/app/home/DesktopNav';
import MobileNav from '@/app/home/MobileNav';
import LocationSelector from '@/app/public/LocationSelector';
import { useLawyers } from "@/lib/api/useApi";
import { provinces } from "@/lib/api/mockData";

export default function LawyersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize with empty values
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Initialize state from URL params on component mount
    useEffect(() => {
        const province = searchParams.get('province') || '';
        const city = searchParams.get('city') || '';
        const specialty = searchParams.get('specialty') || '';
        const search = searchParams.get('search') || '';

        setSelectedProvince(province);
        setSelectedCity(city);
        setSelectedSpecialty(specialty);
        setSearchTerm(search);
    }, [searchParams]);

    // Prepare filters object - only include non-empty values
    const filters = {
        specialty: selectedSpecialty || undefined,
        province: selectedProvince || undefined,
        city: selectedCity || undefined,
        includeVIP: true
    };

    const { data: lawyers, isLoading, error } = useLawyers(filters);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle search submission
    const handleSearchSubmit = () => {
        const params = new URLSearchParams();
        if (selectedProvince) params.append('province', selectedProvince);
        if (selectedCity) params.append('city', selectedCity);
        if (selectedSpecialty) params.append('specialty', selectedSpecialty);
        if (searchTerm) params.append('search', searchTerm);

        router.push(`/lawyers?${params.toString()}`);
    };

    // Reset filters
    const resetFilters = () => {
        setSelectedProvince('');
        setSelectedCity('');
        setSelectedSpecialty('');
        setSearchTerm('');
        router.push('/lawyers');
    };

    // Handle location change
    const handleLocationChange = (provinceId: string, cityName: string) => {
        setSelectedProvince(provinceId);
        setSelectedCity(cityName);
    };

    // Filter lawyers based on search term (other filters are handled by API)
    const filteredLawyers = lawyers?.filter(lawyer => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                lawyer.name.toLowerCase().includes(term) ||
                lawyer.lastName.toLowerCase().includes(term) ||
                lawyer.specialty.toLowerCase().includes(term)
            );
        }
        return true;
    }) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <Filter className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                        <p className="text-gray-600 mb-4">
                            خطا در بارگذاری لیست وکلا. لطفاً صفحه را رفرش کنید.
                        </p>
                        <Button onClick={() => window.location.reload()} className="bg-[#ca2a30] hover:bg-[#b02529]">
                            تلاش مجدد
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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

            {/* Search Section - Only visible on mobile */}
            <div className="md:hidden px-4 pt-4">
                <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder="جستجوی نام وکیل یا تخصص..."
                            className="pl-10 h-12 border-gray-300 focus:border-[#ca2a30] focus:ring-[#ca2a30]"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        />
                    </div>
                </div>
            </div>

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

                {/* Lawyers Grid - Desktop */}
                <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredLawyers.map(lawyer => (
                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                </div>



                {/* Empty State */}
                {filteredLawyers.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="text-gray-400 mb-4">
                                <Filter className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">وکیلی یافت نشد</h3>
                            <p className="text-gray-600 mb-4">
                                با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید
                            </p>
                            <Button onClick={resetFilters} variant="outline">
                                حذف فیلترها
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Mobile Footer */}
            <MobileFooter />
        </div>
    );
}