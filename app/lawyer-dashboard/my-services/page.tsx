//app/lawyer-dashboard/my-services/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";

import { useAuth, useUpdateOfferedServices } from "@/lib/api/useApi";
import { CheckCircle, X, DollarSign } from "lucide-react";
import {availableServices} from "@/lib/api/mockData";

export default function LawyerMyServicesPage() {
    const { user: currentUser } = useAuth();
    const updateOfferedServices = useUpdateOfferedServices();

    // State برای خدمات انتخاب شده
    const [selectedServices, setSelectedServices] = useState(
        currentUser?.offeredServices || []
    );

    const toggleService = (service: any) => {
        const existingIndex = selectedServices.findIndex(s => s.id === service.id);
        if (existingIndex >= 0) {
            // حذف اگر قبلاً انتخاب شده
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            // اضافه کردن با قیمت پیش‌فرض
            setSelectedServices([...selectedServices, { ...service }]);
        }
    };

    const updatePrice = (serviceId: string, price: number) => {
        setSelectedServices(selectedServices.map(service =>
            service.id === serviceId ? { ...service, price } : service
        ));
    };

    const handleSave = () => {
        if (currentUser) {
            updateOfferedServices.mutate({
                userId: currentUser.id,
                services: selectedServices
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">خدمات من</h1>
                <Button
                    onClick={handleSave}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={updateOfferedServices.isPending}
                >
                    {updateOfferedServices.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>خدمات موجود</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableServices.map(service => {
                            const isSelected = selectedServices.some(s => s.id === service.id);
                            const selectedService = selectedServices.find(s => s.id === service.id);

                            return (
                                <div
                                    key={service.id}
                                    className={`p-4 border rounded-lg ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleService(service)}
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-400'
                                                }`}
                                            >
                                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                            </button>
                                            <span className="font-medium">{service.name}</span>
                                        </div>
                                        {isSelected && (
                                            <button
                                                onClick={() => toggleService(service)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                قیمت (تومان)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-500" />
                                                <input
                                                    type="number"
                                                    value={selectedService?.price || service.price}
                                                    onChange={(e) => updatePrice(service.id, parseInt(e.target.value) || 0)}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}