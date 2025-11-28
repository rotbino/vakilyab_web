"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/radix/button";
import {Search, MapPin, User, MessageSquare , Phone, ShieldQuestion} from "lucide-react";
import {useAuth, useUserQuestionStats} from "@/lib/api/useApi";
import Link from "next/link";
import PanelLink from "@/app/public/PanelLink";
import LocationSelector from "@/app/public/LocationSelector";
import { Input } from "@/components/radix/input";
import { provinces } from "@/lib/api/mockData";

interface DesktopNavProps {
    onLocationChange: (provinceId: string, cityName: string) => void;
    selectedProvince: string;
    selectedCity: string;
}

export default function DesktopNav({ onLocationChange, selectedProvince, selectedCity }: DesktopNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user: currentUser } = useAuth();
    const { data: userStats } = useUserQuestionStats(currentUser?.id);

    // Set default to Tehran on initial load
    useEffect(() => {
        if (!selectedProvince && !selectedCity) {
            const tehranProvince = provinces.find(p => p.name === "تهران");
            if (tehranProvince) {
                onLocationChange(tehranProvince.id, "تهران");
            }
        }
    }, [selectedProvince, selectedCity, onLocationChange]);

    const handleSearch = (word?:string) => {
        const params = new URLSearchParams();
        if (selectedProvince) params.append('province', selectedProvince);
        if (selectedCity) params.append('city', selectedCity);
        if (word || searchTerm) params.append('search', word ||searchTerm);

        router.push(`/lawyers?${params.toString()}`);
    };

    return (
        <nav className="hidden md:flex items-center justify-between py-4 px-6 bg-white shadow-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center">
                <div>
                    <div className="text-xl font-bold text-[#ca2a30]">وکیل یاب</div>
                    <div className="text-xs font-bold mt-2 text-[#666]">پلتفرم ارتباط با بهترین وکلا</div>
                </div>
            </Link>

            {/* Search and Location in one row */}
            <div className="flex items-center gap-4 flex-1 max-w-3xl mx-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    <Input
                        placeholder="جستجوی نام وکیل یا تخصص..."
                        className="pl-10 h-12 border-gray-300  focus:border-[#ca2a30] focus:ring-[#ca2a30]"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value)
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <LocationSelector
                    selectedProvince={selectedProvince}
                    selectedCity={selectedCity}
                    onLocationChange={onLocationChange}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Link href="/questions">
                    <Button variant="ghost" className="flex items-center gap-2 relative">
                        <ShieldQuestion className="w-4 h-4" />
                        <span>سوالات حقوقی</span>
                        {userStats?.newAnswersCount && userStats.newAnswersCount > 0 ? (
                            <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {5}
              </span>
                        ):null}
                    </Button>
                </Link>
                <span className="flex items-center gap-1 text-sm">
                    <MessageSquare  className="w-4 h-4"/>
                </span>

                <span className="flex items-center gap-1 text-sm">
                    <Phone className="w-4 h-4"/>
                </span>
                <div className="flex items-center gap-2">
                    <PanelLink >
                        <Button variant="outline" className="flex items-center gap-2 rounded-full w-16 h-16">
                            <User className="w-4 h-4"/>
                        </Button>
                    </PanelLink>
                </div>
            </div>
        </nav>
    );
}