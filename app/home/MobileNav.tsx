// MobileNav.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/radix/button";
import { Search, MapPin, User, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/api/useApi";
import Link from "next/link";
import LocationSelector from "@/app/public/LocationSelector";


interface MobileNavProps {
    selectedProvince: string;
    selectedCity: string;
    onLocationChange: (provinceId: string, cityName: string) => void;
}

export default function MobileNav({
                                      selectedProvince,
                                      selectedCity,
                                      onLocationChange
                                  }: MobileNavProps) {
    const pathname = usePathname();
    const { profile, logout } = useAuth();

    return (
        <div className="md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white shadow-sm">
                <Link href="/" className="flex items-center">
                    <div>
                        <div className="text-xl font-bold text-[#ca2a30]">وکیل یاب</div>
                        <div className="text-xs font-bold mt-2 text-[#666]">پلتفرم ارتباط با بهترین وکلا</div>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Location Selector - Mobile */}
                    <LocationSelector
                        selectedProvince={selectedProvince}
                        selectedCity={selectedCity}
                        onLocationChange={onLocationChange}
                        isMobile={true}
                    />
                </div>
            </div>
        </div>
    );
}