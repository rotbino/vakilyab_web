// components/TimeSlotManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    Clock,
    Settings,
    CheckCircle,
    Circle,
    Edit,
    Save,
    Plus,
    Trash2
} from "lucide-react";
import { TimeSlot, WeeklyTemplate } from "@/lib/api/types";
import {
    useTimeSlots,
    useWeeklyTemplate,
    useSaveTimeSlots,
    useSaveWeeklyTemplate,
    useApplyTemplateToRange
} from "@/lib/api/useApi";
import { formatDate, getPersianDayName, getDayName } from "@/lib/utils";
import {updateTimeSlots} from "@/lib/store/slices/authSlice";
import { useDispatch } from "react-redux";
interface TimeSlotManagerProps {
    lawyerId: string;
    onTimeSlotsChange?: (timeSlots: TimeSlot[]) => void;
}

// Days of week starting from Saturday (Persian calendar)
const daysOfWeek = [
    "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"
];

const persianDays = [
    "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"
];

export default function TimeSlotManager({ lawyerId, onTimeSlotsChange }: TimeSlotManagerProps) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'weekly-template' | 'this-week'>('weekly-template');
    const [next7Days, setNext7Days] = useState<string[]>([]);
    const [lastAppliedDate, setLastAppliedDate] = useState<string>("");
    const [newTimeSlot, setNewTimeSlot] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });
    const dispatch = useDispatch();
    // Fetch data using hooks
    const { data: timeSlots = [], refetch: refetchTimeSlots } = useTimeSlots(lawyerId);
    const { data: weeklyTemplate = {}, refetch: refetchWeeklyTemplate } = useWeeklyTemplate(lawyerId);

    // Mutations
    const saveTimeSlotsMutation = useSaveTimeSlots();
    const saveWeeklyTemplateMutation = useSaveWeeklyTemplate();
    const applyTemplateMutation = useApplyTemplateToRange();

    // Initialize next 7 days
    useEffect(() => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }

        setNext7Days(days);
        if (days.length > 0) {
            setSelectedDate(days[0]);
        }
    }, []);

    // Initialize with sample data if template is empty
    useEffect(() => {
        if (Object.keys(weeklyTemplate).length === 0) {
            const sampleTemplate: WeeklyTemplate = {
                saturday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                sunday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                monday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                tuesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                wednesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                thursday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                friday: { hours: [], isHoliday: true }
            };

            saveWeeklyTemplateMutation.mutate({
                lawyerId,
                template: sampleTemplate
            });
        }
    }, [lawyerId, weeklyTemplate, saveWeeklyTemplateMutation]);

    // components/TimeSlotManager.tsx

    const handleTimeSlotsChange = async (newTimeSlots: TimeSlot[]) => {
        try {
            // استفاده از mutation برای ذخیره زمان‌ها
            await saveTimeSlotsMutation.mutateAsync({
                lawyerId,
                slots: newTimeSlots
            });

            // به‌روزرسانی state کاربر با استفاده از Redux
            dispatch(updateTimeSlots({ lawyerId, timeSlots: newTimeSlots }));

            // فراخوانی callback اگر وجود داشته باشد
            if (onTimeSlotsChange) {
                onTimeSlotsChange(newTimeSlots);
            }
        } catch (error) {
            console.error('Error saving time slots:', error);
        }
    };
    // Check if a date is holiday based on template
    const isHolidayFromTemplate = (dateString: string) => {
        const dayName = getDayName(dateString);
        return weeklyTemplate[dayName]?.isHoliday || false;
    };

    // Check if a date is manually overridden as non-holiday
    const isManuallyNonHoliday = (dateString: string) => {
        return timeSlots.some(slot => slot.date === dateString && slot.isBooked === false);
    };

    // Check if a date is holiday
    const isHoliday = (dateString: string) => {
        // If there are any time slots for this date, it's not a holiday (manually overridden)
        if (isManuallyNonHoliday(dateString)) {
            return false;
        }
        // Otherwise, check the template
        return isHolidayFromTemplate(dateString);
    };

    // Toggle time slot
    // Toggle time slot
    const toggleTimeSlot = (hour: number) => {
        if (!selectedDate) return;

        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const slotId = `${selectedDate}-${startTime}`;

        const existingSlotIndex = timeSlots.findIndex(slot =>
            slot.date === selectedDate && slot.startTime === startTime
        );

        let updatedSlots;
        if (existingSlotIndex >= 0) {
            updatedSlots = timeSlots.filter((_, index) => index !== existingSlotIndex);
        } else {
            const newSlot: TimeSlot = {
                id: slotId,
                date: selectedDate,
                startTime,
                endTime,
                isBooked: false
            };
            updatedSlots = [...timeSlots, newSlot];
        }

        handleTimeSlotsChange(updatedSlots);
    };


// Add custom time slot
    const addCustomTimeSlot = () => {
        if (!newTimeSlot.date || !newTimeSlot.startTime || !newTimeSlot.endTime) {
            alert("لطفاً تمام فیلدها را پر کنید");
            return;
        }

        const slotId = `${newTimeSlot.date}-${newTimeSlot.startTime}`;

        // Check if slot already exists
        const existingSlotIndex = timeSlots.findIndex(slot =>
            slot.date === newTimeSlot.date && slot.startTime === newTimeSlot.startTime
        );

        if (existingSlotIndex >= 0) {
            alert("این زمان قبلاً ثبت شده است");
            return;
        }

        const newSlot: TimeSlot = {
            id: slotId,
            date: newTimeSlot.date,
            startTime: newTimeSlot.startTime,
            endTime: newTimeSlot.endTime,
            isBooked: false
        };

        const updatedSlots = [...timeSlots, newSlot];
        handleTimeSlotsChange(updatedSlots);

        // Reset form
        setNewTimeSlot({
            date: "",
            startTime: "",
            endTime: ""
        });
    };


    const deleteTimeSlot = (slotId: string) => {
        const updatedSlots = timeSlots.filter(slot => slot.id !== slotId);
        handleTimeSlotsChange(updatedSlots);
    };


// Toggle holiday status for a specific date
    const toggleDateHolidayStatus = (dateString: string) => {
        if (isHolidayFromTemplate(dateString)) {
            // If it's a holiday in template, we can add time slots to make it non-holiday
            const dayName = getDayName(dateString);
            const templateDay = weeklyTemplate[dayName];

            if (templateDay) {
                // Remove existing slots for this date
                let updatedSlots = timeSlots.filter(slot => slot.date !== dateString);

                // Add new slots based on template hours
                templateDay.hours.forEach(hour => {
                    const startTime = `${hour.toString().padStart(2, '0')}:00`;
                    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                    updatedSlots.push({
                        id: `${dateString}-${startTime}`,
                        date: dateString,
                        startTime,
                        endTime,
                        isBooked: false
                    });
                });

                handleTimeSlotsChange(updatedSlots);
            }
        } else {
            // If it's not a holiday in template, remove all slots to make it holiday
            const updatedSlots = timeSlots.filter(slot => slot.date !== dateString);
            handleTimeSlotsChange(updatedSlots);
        }
    };


    // Apply weekly template to next month
    const applyWeeklyTemplateToNextMonth = () => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);

        applyTemplateMutation.mutate({
            lawyerId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        }, {
            onSuccess: () => {
                refetchTimeSlots();
                setLastAppliedDate(endDate.toISOString().split('T')[0]);
            }
        });
    };

    // Toggle weekly template hour
    const toggleWeeklyTemplateHour = (day: string, hour: number) => {
        const updatedTemplate = { ...weeklyTemplate };
        if (!updatedTemplate[day]) {
            updatedTemplate[day] = { hours: [], isHoliday: false };
        }

        const currentHours = updatedTemplate[day].hours;
        const updatedHours = currentHours.includes(hour)
            ? currentHours.filter(h => h !== hour)
            : [...currentHours, hour];

        updatedTemplate[day] = {
            ...updatedTemplate[day],
            hours: updatedHours
        };

        saveWeeklyTemplateMutation.mutate({
            lawyerId,
            template: updatedTemplate
        }, {
            onSuccess: () => {
                refetchWeeklyTemplate();
            }
        });
    };

    // Toggle weekly template holiday
    const toggleWeeklyTemplateHoliday = (day: string) => {
        const updatedTemplate = { ...weeklyTemplate };
        if (!updatedTemplate[day]) {
            updatedTemplate[day] = { hours: [], isHoliday: false };
        }

        updatedTemplate[day] = {
            ...updatedTemplate[day],
            isHoliday: !updatedTemplate[day].isHoliday,
            hours: updatedTemplate[day].isHoliday ? [] : updatedTemplate[day].hours
        };

        saveWeeklyTemplateMutation.mutate({
            lawyerId,
            template: updatedTemplate
        }, {
            onSuccess: () => {
                refetchWeeklyTemplate();
            }
        });
    };

    // Check if hour is selected
    const isHourSelected = (hour: number) => {
        if (!selectedDate) return false;

        return timeSlots.some(slot =>
            slot.date === selectedDate &&
            slot.startTime === `${hour.toString().padStart(2, '0')}:00`
        );
    };

    // Generate hours (8 to 22)
    const hours = Array.from({ length: 15 }, (_, i) => i + 8);

    // Loading states
    const isLoading = saveTimeSlotsMutation.isPending ||
        saveWeeklyTemplateMutation.isPending ||
        applyTemplateMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ca2a30]" />
                        مدیریت زمان‌های مشاوره
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => setActiveTab('weekly-template')}
                            variant={activeTab === 'weekly-template' ? "default" : "outline"}
                            className={`flex items-center gap-2 ${
                                activeTab === 'weekly-template'
                                    ? "bg-[#ca2a30] hover:bg-[#b02529]"
                                    : ""
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            قالب هفتگی
                        </Button>

                        <Button
                            onClick={() => setActiveTab('this-week')}
                            variant={activeTab === 'this-week' ? "default" : "outline"}
                            className={`flex items-center gap-2 ${
                                activeTab === 'this-week'
                                    ? "bg-[#ca2a30] hover:bg-[#b02529]"
                                    : ""
                            }`}
                        >
                            <Edit className="w-4 h-4" />
                            ساعات کاری این هفته
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Content */}
            {activeTab === 'weekly-template' && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>قالب زمانی هفتگی</CardTitle>
                            <Button
                                onClick={applyWeeklyTemplateToNextMonth}
                                disabled={isLoading}
                                className="bg-[#ca2a30] hover:bg-[#b02529] flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isLoading ? "در حال اعمال..." : "اعمال این قالب به یک ماه آینده"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {persianDays.map((day, index) => {
                            const dayKey = daysOfWeek[index];
                            const templateDay = weeklyTemplate[dayKey] || { hours: [], isHoliday: false };

                            return (
                                <div key={dayKey} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium">{day}</h3>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={templateDay.isHoliday}
                                                onChange={() => toggleWeeklyTemplateHoliday(dayKey)}
                                                disabled={isLoading}
                                                className="w-4 h-4 text-[#ca2a30] rounded focus:ring-[#ca2a30]"
                                            />
                                            <span className="text-sm">روز تعطیل</span>
                                        </label>
                                    </div>

                                    {!templateDay.isHoliday && (
                                        <div className="flex flex-wrap gap-2">
                                            {hours.map(hour => (
                                                <button
                                                    key={hour}
                                                    onClick={() => toggleWeeklyTemplateHour(dayKey, hour)}
                                                    disabled={isLoading}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        templateDay.hours.includes(hour)
                                                            ? "bg-[#ca2a30] text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {hour}-{hour + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {lastAppliedDate && (
                            <div className="pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    این قالب تا تاریخ {formatDate(lastAppliedDate)} اعمال شده است.
                                    هر زمان که بخواهید می‌توانید قالب را تغییر داده و مجدداً اعمال کنید.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'this-week' && (
                <div className="space-y-6">
                    {/* Date Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle>انتخاب روز</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold">
                                        {selectedDate && getPersianDayName(selectedDate)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedDate && formatDate(selectedDate)}
                                    </div>
                                    {isHoliday(selectedDate) && (
                                        <Badge className="mt-2 bg-red-100 text-red-800">
                                            روز تعطیل
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
                                {next7Days.map(date => (
                                    <button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex-shrink-0 px-4 py-3 rounded-lg text-center min-w-[120px] ${
                                            selectedDate === date
                                                ? "bg-[#ca2a30] text-white"
                                                : isHoliday(date)
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        <div className="font-medium">
                                            {getPersianDayName(date).substring(0, 3)}
                                        </div>
                                        <div className="text-sm">
                                            {new Date(date).getDate()}
                                        </div>
                                        {isHoliday(date) && (
                                            <div className="text-xs mt-1">تعطیل</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custom Time Slot */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                افزودن زمان دلخواه
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        تاریخ
                                    </label>
                                    <input
                                        type="date"
                                        value={newTimeSlot.date}
                                        onChange={(e) => setNewTimeSlot({...newTimeSlot, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ساعت شروع
                                    </label>
                                    <input
                                        type="time"
                                        value={newTimeSlot.startTime}
                                        onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ساعت پایان
                                    </label>
                                    <input
                                        type="time"
                                        value={newTimeSlot.endTime}
                                        onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={addCustomTimeSlot}
                                        disabled={isLoading}
                                        className="w-full bg-[#ca2a30] hover:bg-[#b02529]"
                                    >
                                        <Plus className="w-4 h-4 ml-1" />
                                        افزودن
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Slots Grid */}
                    {selectedDate && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#ca2a30]" />
                                        ساعات کاری - {getPersianDayName(selectedDate)}
                                    </CardTitle>
                                    {isHolidayFromTemplate(selectedDate) && (
                                        <Button
                                            onClick={() => toggleDateHolidayStatus(selectedDate)}
                                            variant="outline"
                                            size="sm"
                                            disabled={isLoading}
                                            className="text-[#ca2a30] border-[#ca2a30] hover:bg-[#fef2f2]"
                                        >
                                            {isManuallyNonHoliday(selectedDate) ? "تبدیل به روز تعطیل" : "تبدیل به روز کاری"}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!isHoliday(selectedDate) ? (
                                    <>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                            {hours.map(hour => (
                                                <button
                                                    key={hour}
                                                    onClick={() => toggleTimeSlot(hour)}
                                                    disabled={isLoading}
                                                    className={`p-4 border rounded-lg transition-colors text-center ${
                                                        isHourSelected(hour)
                                                            ? "border-[#ca2a30] bg-[#fef2f2]"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        {isHourSelected(hour) ? (
                                                            <CheckCircle className="w-5 h-5 text-[#ca2a30] mb-1" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-400 mb-1" />
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {hour.toString().padStart(2, '0')}-{(hour + 1).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {timeSlots.filter(slot => slot.date === selectedDate).length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <h3 className="font-medium mb-3">ساعات انتخاب شده:</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {timeSlots
                                                        .filter(slot => slot.date === selectedDate)
                                                        .map(slot => (
                                                            <div key={slot.id} className="flex items-center gap-1">
                                                                <Badge
                                                                    className="bg-[#fef2f2] text-[#ca2a30] px-3 py-1"
                                                                >
                                                                    {slot.startTime} - {slot.endTime}
                                                                </Badge>
                                                                <button
                                                                    onClick={() => deleteTimeSlot(slot.id)}
                                                                    disabled={isLoading}
                                                                    className="p-1 rounded text-red-600 hover:bg-red-100"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">این روز تعطیل است</p>
                                        {isHolidayFromTemplate(selectedDate) && (
                                            <Button
                                                onClick={() => toggleDateHolidayStatus(selectedDate)}
                                                disabled={isLoading}
                                                className="bg-[#ca2a30] hover:bg-[#b02529]"
                                            >
                                                تبدیل به روز کاری
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>خلاصه زمان‌های مشاوره</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#ca2a30]">
                                {timeSlots.length}
                            </div>
                            <div className="text-sm text-gray-600">کل زمان‌های ثبت شده</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {timeSlots.filter(slot => !slot.isBooked).length}
                            </div>
                            <div className="text-sm text-gray-600">زمان‌های مشاوره آزاد</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {Object.values(weeklyTemplate).filter(day => day.isHoliday).length}
                            </div>
                            <div className="text-sm text-gray-600">روزهای تعطیل در هفته</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}