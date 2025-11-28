// app/lawyer-dashboard/schedule/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Calendar, Clock, Users } from "lucide-react";
import TimeSlotManager from "@/app/lawyer-dashboard/TimeSlotManager";
import { useAuth } from "@/lib/api/useApi";
import { useTimeSlots, useSaveTimeSlots } from "@/lib/api/useApi";
import {useDispatch} from "react-redux";
import { Button } from '@/components/radix/button';
interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

export default function SchedulePage() {
    // استفاده از هوک useAuth برای دریافت اطلاعات کاربر
    const { user: currentUser, isAuthenticated } = useAuth();

    // استفاده از هوک React Query برای دریافت زمان‌ها
    const { data: timeSlots = [], isLoading, refetch } = useTimeSlots(currentUser?.id || '');
    const dispatch = useDispatch();
    // استفاده از هوک برای ذخیره زمان‌ها
    const saveTimeSlotsMutation = useSaveTimeSlots();
    const handleRefresh = () => {
        refetch();
    };


    const handleTimeSlotsChange = async (newTimeSlots: TimeSlot[]) => {
        try {
            // استفاده از mutation برای ذخیره زمان‌ها
            await saveTimeSlotsMutation.mutateAsync({
                lawyerId: currentUser?.id || '',
                slots: newTimeSlots
            });

            // به‌روزرسانی state کاربر با استفاده از Redux
            dispatch(updateTimeSlots({ lawyerId: currentUser?.id || '', timeSlots: newTimeSlots }));

            // به‌روزرسانی داده‌ها پس از ذخیره موفق
            refetch();
        } catch (error) {
            console.error('Error saving time slots:', error);
            // می‌توانید یک پیام خطا به کاربر نمایش دهید
        }
    };

    // اگر کاربر احراز هویت نشده باشد
    if (!isAuthenticated || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    // محاسبه آمار زمان‌ها
    const totalSlots = timeSlots.length;
    const availableSlots = timeSlots.filter(slot => !slot.isBooked).length;
    const bookedSlots = timeSlots.filter(slot => slot.isBooked).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <CardTitle>مدیریت زمان‌های خالی</CardTitle>
                <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-[#b02529]"
                >
                    رفرش زمان‌ها
                </Button>
            </div>
            <div className="bg-gradient-to-r from-orange-600 to-[#b02529] rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    مدیریت زمان‌های خالی
                </h1>
                <p className="opacity-90">
                    زمان‌های خالی خود را برای مشاوره ثبت کنید تا کاربران بتوانند رزرو کنند.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4"/>
                            کل زمان‌های ثبت شده
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSlots}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4"/>
                            زمان‌های خالی
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableSlots}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4"/>
                            زمان‌های رزرو شده
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookedSlots}</div>
                    </CardContent>
                </Card>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <TimeSlotManager
                    lawyerId={currentUser.id}
                    timeSlots={timeSlots}
                    onTimeSlotsChange={handleTimeSlotsChange}
                    isLoading={saveTimeSlotsMutation.isPending}
                />
            )}
        </div>
    );
}