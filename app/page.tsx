'use client';

import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Briefcase, Crown } from 'lucide-react';
import { Button } from '@/components/radix/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import LawyerCard from '@/app/home/LawyerCard';

import MobileFooter from '@/app/home/MobileFooter';
import DesktopNav from '@/app/home/DesktopNav';
import MobileNav from '@/app/home/MobileNav';
import ProcessStepper from '@/app/home/ProcessStepper';

import LawyerRegistrationCTA from '@/app/home/LawyerRegistrationCTA';
import BenefitsSection from '@/app/home/BenefitsSection';
import Link from "next/link";
import { useLawyers } from "@/lib/api/useApi";
import { provinces } from "@/lib/api/mockData";
import {Input} from "@/components/radix/input";


export default function MainPage() {
  const router = useRouter();

  // Set default to Tehran
  const [selectedProvince, setSelectedProvince] = useState<string>(() => {
    const tehranProvince = provinces.find(p => p.name === "تهران");
    return tehranProvince ? tehranProvince.id : "";
  });
  const [selectedCity, setSelectedCity] = useState<string>("تهران");
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: lawyers, isLoading, error } = useLawyers();

  // Handle location change
  const handleLocationChange = (provinceId: string, cityName: string) => {
    setSelectedProvince(provinceId);
    setSelectedCity(cityName);
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvince) params.append('province', selectedProvince);
    if (selectedCity) params.append('city', selectedCity);
    if (searchTerm) params.append('search', searchTerm);

    router.push(`/lawyers?${params.toString()}`);
  };

  // Get recently registered lawyers (non-VIP)
  const recentLawyers = lawyers
      ?.filter(lawyer => !lawyer.isVIP)
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 6) || [];

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
                  onChange={(e) => {
                    //setSearchTerm(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6">
          {/* Specialties Filter Bar */}
          <div className="mb-6">
            <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
              <Link href="/lawyers">
                <button
                    className={`flex-shrink-0 px-4 py-2 mx-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300`}>
                  همه
                </button>
              </Link>
              {['حقوقی', 'خانواده', 'کیفری', 'مالیاتی', 'کار', 'تجاری', 'ملکی', 'ثبتی', 'شرکت‌ها', 'بین‌الملل'].map(specialty => (
                  <Link key={specialty} href={`/lawyers?specialty=${specialty}`}>
                    <button
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300`}>
                      {specialty}
                    </button>
                  </Link>
              ))}
            </div>
          </div>

          {/* Lawyers List */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">لیست وکلا</h2>
              <Link href="/lawyers">
                <Button variant="outline" className="text-[#ca2a30] border-[#ca2a30]">
                  مشاهده همه
                </Button>
              </Link>
            </div>

            {/* Lawyers Grid - Desktop */}
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lawyers?.slice(0, 6).map(lawyer => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer}  />
              ))}
            </div>


          </div>

          {/* Lawyer Registration CTA */}
          <LawyerRegistrationCTA />

          {/* Recently Registered Lawyers */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">وکلای جدید</h2>
              <Link href="/lawyers">
                <Button variant="outline" className="text-[#ca2a30] border-[#ca2a30]">
                  مشاهده همه
                </Button>
              </Link>
            </div>

            {/* Lawyers Grid - Desktop */}
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recentLawyers.map(lawyer => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>


          </div>

          {/* Process Steps */}
          <ProcessStepper currentStep={1} />

          {/* Benefits Section */}
          <BenefitsSection />
        </div>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
  );
}