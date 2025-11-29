// app/lawyer-dashboard/ConsultationPricingManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Badge } from '@/components/radix/badge';
import { Switch } from '@/components/radix/switch';
import { Settings, Save, Clock, DollarSign, Phone, Video, User } from 'lucide-react';
import { useConsultationPricing, useUpdateConsultationPricing } from '@/lib/api/useApi';
import { useAuth } from '@/lib/api/useApi';

const consultationTypes = [
    { id: 'in-person', name: 'حضوری', description: 'مشاوره حضوری در دفتر وکیل', icon: User },
    { id: 'phone', name: 'تلفنی', description: 'مشاوره تلفنی', icon: Phone },
    { id: 'video', name: 'تماس ویدئویی', description: 'مشاوره تماس ویدئوییدر واتساپ', icon: Video }
];

const pricingOptions = [
    { duration: '15min', name: '15 دقیقه', defaultPrice: 150000 },
    { duration: '30min', name: '30 دقیقه', defaultPrice: 250000 },
    { duration: '45min', name: '45 دقیقه', defaultPrice: 350000 },
    { duration: '60min', name: '1 ساعت', defaultPrice: 450000 },
    { duration: '90min', name: '1.5 ساعت', defaultPrice: 600000 },
    { duration: '120min', name: '2 ساعت', defaultPrice: 750000 }
];

export default function ConsultationPricingManager() {
    const { user: currentUser } = useAuth();
    const { data: pricing = [], isLoading } = useConsultationPricing(currentUser?.id);
    const updatePricingMutation = useUpdateConsultationPricing();

    const [localPricing, setLocalPricing] = useState(pricing);
    const [globalPhonePercentage, setGlobalPhonePercentage] = useState(80);
    const [globalVideoPercentage, setGlobalVideoPercentage] = useState(90);

    // همگام‌سازی داده‌های محلی با داده‌های سرور
    useEffect(() => {
        setLocalPricing(pricing);
        if (pricing.length > 0) {
            setGlobalPhonePercentage(pricing[0].phonePercentage);
            setGlobalVideoPercentage(pricing[0].videoPercentage);
        }
    }, [pricing]);

    // اعمال درصد جهانی به همه قیمت‌ها
    const applyGlobalPercentage = () => {
        const updatedPricing = localPricing.map(option => ({
            ...option,
            phonePrice: Math.round(option.inPersonPrice * globalPhonePercentage / 100),
            videoPrice: Math.round(option.inPersonPrice * globalVideoPercentage / 100),
            phonePercentage: globalPhonePercentage,
            videoPercentage: globalVideoPercentage
        }));
        setLocalPricing(updatedPricing);
    };

    const handlePriceChange = (duration: string, type: 'inPerson' | 'phone' | 'video', price: string) => {
        const numericPrice = parseInt(price) || 0;
        setLocalPricing(prev => {
            const existing = prev.find(p => p.duration === duration);
            if (existing) {
                return prev.map(p =>
                    p.duration === duration
                        ? { ...p, [`${type}Price`]: numericPrice }
                        : p
                );
            } else {
                const defaultOption = pricingOptions.find(opt => opt.duration === duration);
                return [...prev, {
                    id: `${currentUser?.id}_${duration}`,
                    lawyerId: currentUser?.id || '',
                    duration,
                    inPersonPrice: type === 'inPerson' ? numericPrice : defaultOption?.defaultPrice || 0,
                    phonePrice: type === 'phone' ? numericPrice : Math.round((defaultOption?.defaultPrice || 0) * globalPhonePercentage / 100),
                    videoPrice: type === 'video' ? numericPrice : Math.round((defaultOption?.defaultPrice || 0) * globalVideoPercentage / 100),
                    phonePercentage: globalPhonePercentage,
                    videoPercentage: globalVideoPercentage,
                    isActive: true
                }];
            }
        });
    };

    const handleToggleActive = (duration: string, isActive: boolean) => {
        setLocalPricing(prev =>
            prev.map(p =>
                p.duration === duration
                    ? { ...p, isActive }
                    : p
            )
        );
    };

    const handleSave = () => {
        if (!currentUser) return;

        updatePricingMutation.mutate({
            lawyerId: currentUser.id,
            pricing: localPricing
        });
    };

    const hasActivePricing = localPricing.some(p => p.isActive);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* تنظیمات درصد جهانی */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-500" />
                        تنظیمات درصدی قیمت‌ها
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                درصد قیمت مشاوره تلفنی
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={globalPhonePercentage}
                                    onChange={(e) => setGlobalPhonePercentage(parseInt(e.target.value) || 0)}
                                    className="w-24"
                                    min="0"
                                    max="100"
                                />
                                <span className="text-sm">درصد قیمت حضوری</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                درصد قیمت مشاوره تماس ویدئویی
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={globalVideoPercentage}
                                    onChange={(e) => setGlobalVideoPercentage(parseInt(e.target.value) || 0)}
                                    className="w-24"
                                    min="0"
                                    max="100"
                                />
                                <span className="text-sm">درصد قیمت حضوری</span>
                            </div>
                        </div>
                    </div>

                    <Button onClick={applyGlobalPercentage} className="mt-2">
                        اعمال درصد به همه زمان‌ها
                    </Button>
                </CardContent>
            </Card>

            {/* تنظیمات قیمت هر زمان */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        تنظیم قیمت‌های مشاوره
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!hasActivePricing && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-orange-800">
                                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white">!</span>
                                    </div>
                                    <p className="text-sm">
                                        شما هنوز قیمت‌های مشاوره خود را تنظیم نکرده‌اید. لطفاً قیمت‌ها را تنظیم کنید تا کاربران بتوانند مشاوره رزرو کنند.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {pricingOptions.map(option => {
                            const currentPricing = localPricing.find(p => p.duration === option.duration);
                            const inPersonPrice = currentPricing?.inPersonPrice || option.defaultPrice;
                            const phonePrice = currentPricing?.phonePrice || Math.round(option.defaultPrice * globalPhonePercentage / 100);
                            const videoPrice = currentPricing?.videoPrice || Math.round(option.defaultPrice * globalVideoPercentage / 100);
                            const isActive = currentPricing?.isActive ?? true;

                            return (
                                <div key={option.duration} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-500" />
                                            <span className="font-medium">{option.name}</span>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={(checked) => handleToggleActive(option.duration, checked)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {consultationTypes.map(type => (
                                            <div key={type.id} className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <type.icon className="w-4 h-4" />
                                                    {type.name}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                                    <Input
                                                        type="number"
                                                        value={
                                                            type.id === 'in-person' ? inPersonPrice :
                                                                type.id === 'phone' ? phonePrice :
                                                                    videoPrice
                                                        }
                                                        onChange={(e) => handlePriceChange(option.duration, type.id as 'inPerson' | 'phone' | 'video', e.target.value)}
                                                        className="w-full"
                                                        min="0"
                                                        placeholder={option.defaultPrice.toLocaleString()}
                                                    />
                                                    <span className="text-sm text-gray-500">تومان</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setLocalPricing(pricing)}
                            disabled={updatePricingMutation.isPending}
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updatePricingMutation.isPending}
                            className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {updatePricingMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}