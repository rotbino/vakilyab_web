"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    Users,
    Clock,
    DollarSign,
    FileText,
    Briefcase,
    BarChart3,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    X, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useAuth, useTimeSlots } from "@/lib/api/useApi";
import SubscriptionBanner from "@/app/lawyer-dashboard/SubscriptionBanner";
import { useLawyerQuestions } from "@/lib/api/useApi";
export default function LawyerDashboardPage() {
    const { user: currentUser, isAuthenticated } = useAuth();
    const { data: timeSlots = [] } = useTimeSlots(currentUser?.id || '');

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // محاسبه آمار مشاوره‌ها
    const todayConsultations = currentUser.consultations?.filter(c =>
        c.date === new Date().toISOString().split('T')[0]
    ) || [];

    const completedConsultations = currentUser.consultations?.filter(c =>
        c.status === 'completed'
    ) || [];

    const pendingConsultations = currentUser.consultations?.filter(c =>
        c.status === 'pending' || c.status === 'confirmed'
    ) || [];

    // محاسبه آمار خدمات
    const activeServices = currentUser.services?.filter(s =>
        s.status === 'in-progress'
    ) || [];

    const completedServices = currentUser.services?.filter(s =>
        s.status === 'completed'
    ) || [];

    // محاسبه آمار مالی
    const completedTransactions = currentUser.transactions?.filter(t =>
        t.status === 'completed'
    ) || [];

    const totalIncome = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyIncome = completedTransactions
        .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

    // محاسبه آمار وکلا
    const totalClients = currentUser.clients?.length || 0;
    const availableTimeSlots = timeSlots.filter(ts => !ts.isBooked).length || 0;

    // کامپوننت خوشامدگویی
    const WelcomeSection = () => (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">خوش آمدید، وکیل {currentUser.name}!</h1>
                    <p className="opacity-90">پنل مدیریت حرفه‌ای شما</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{todayConsultations.length}</div>
                        <div className="text-sm">مشاوره امروز</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{monthlyIncome.toLocaleString()}</div>
                        <div className="text-sm">درآمد این ماه</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // کامپوننت کارت‌های آماری
    const StatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        مشاوره‌های امروز
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{todayConsultations.length}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        {pendingConsultations.length} در انتظار
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        مشتریان فعال
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClients}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        کل مشتریان
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        زمان‌های خالی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{availableTimeSlots}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        این هفته
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        درآمد این ماه
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{monthlyIncome.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        تومان
                    </p>
                </CardContent>
            </Card>
        </div>
    );
    const LawyerServicesSection = () => {
        const { user: currentUser } = useAuth();

        if (!currentUser?.offeredServices || currentUser.offeredServices.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-600" />
                            خدمات من
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="mb-4">شما هنوز خدماتی را برای ارائه انتخاب نکرده‌اید.</p>
                            <Link href="/lawyer-dashboard/my-services">
                                <Button className="bg-orange-600 hover:bg-orange-700">
                                    مدیریت خدمات
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                        خدمات من
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentUser.offeredServices.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <div className="text-sm font-medium">
                                    {service.price.toLocaleString()} تومان
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/lawyer-dashboard/my-services">
                            <Button variant="outline" size="sm">
                                مدیریت کامل خدمات
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    };
    // کامپوننت مشاوره‌های اخیر
    const RecentConsultations = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    مشاوره‌های اخیر
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentUser.consultations && currentUser.consultations.length > 0 ? (
                    currentUser.consultations.slice(0, 3).map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <div className="font-medium">مشتری</div>
                                <div className="text-sm text-gray-600">
                                    {consultation.date} - {consultation.time} ({consultation.duration})
                                </div>
                                {consultation.subject && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        موضوع: {consultation.subject}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge
                                    variant="secondary"
                                    className={
                                        consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {consultation.status === 'completed' ? 'انجام شده' :
                                        consultation.status === 'confirmed' ? 'تایید شده' :
                                            consultation.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                                </Badge>
                                <div className="text-sm font-medium">
                                    {consultation.price.toLocaleString()} تومان
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>هیچ مشاوره‌ای یافت نشد</p>
                    </div>
                )}
                {currentUser.consultations && currentUser.consultations.length > 0 && (
                    <Link href="/lawyer-dashboard/consultations">
                        <Button variant="outline" className="w-full">
                            مشاهده همه مشاوره‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    // کامپوننت خدمات اخیر
    const RecentServices = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    درخواست‌های خدمات اخیر
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentUser.services && currentUser.services.length > 0 ? (
                    currentUser.services.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{service.serviceName}</div>
                                <div className="text-sm text-gray-600 mt-1">مشتری</div>
                                {service.description && (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {service.description}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                                <Badge
                                    variant="secondary"
                                    className={
                                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            service.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {service.status === 'completed' ? 'انجام شده' :
                                        service.status === 'in-progress' ? 'در حال انجام' :
                                            service.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                                </Badge>
                                <div className="text-sm font-medium text-gray-900">
                                    {service.price.toLocaleString()} تومان
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">هیچ درخواست خدمتی یافت نشد</p>
                    </div>
                )}
                {currentUser.services && currentUser.services.length > 0 && (
                    <Link href="/lawyer-dashboard/services">
                        <Button variant="outline" className="w-full">
                            مشاهده همه درخواست‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    // کامپوننت ابزارهای حرفه‌ای
    const ProfessionalTools = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-500" />
                    ابزارهای حرفه‌ای
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href="/lawyer-dashboard/schedule">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="font-medium">مدیریت زمان‌بندی</div>
                                <div className="text-sm text-gray-600">
                                    {availableTimeSlots} زمان خالی
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Link>

                <Link href="/lawyer-dashboard/my-services">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="font-medium">خدمات من</div>
                                <div className="text-sm text-gray-600">
                                    مدیریت خدمات ارائه شده
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Link>

                <Link href="/lawyer-dashboard/reports">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="font-medium">درآمد و گزارشات</div>
                                <div className="text-sm text-gray-600">
                                    {totalIncome.toLocaleString()} تومان درآمد
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                </Link>
            </CardContent>
        </Card>
    );

// اضافه کردن هوک‌های لازم


// اضافه کردن کامپوننت ویجت سوالات
    // app/lawyer-dashboard/LawyerDashboardPage.tsx

/// app/lawyer-dashboard/LawyerDashboardPage.tsx

// بهبود کامپوننت QuestionsWidget
    const QuestionsWidget = () => {
        const { data: pendingQuestions = [] } = useLawyerQuestions({ status: 'pending' });

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-orange-500" />
                            سوالات حقوقی
                        </div>
                        {pendingQuestions.length > 0 && (
                            <Badge className="bg-orange-500 text-white">
                                {pendingQuestions.length} جدید
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-2xl font-bold">{pendingQuestions.length}</div>
                            <p className="text-sm text-gray-500">سوال در انتظار پاسخ</p>
                        </div>
                        <Link href="/lawyer-dashboard/questions">
                            <Button variant="outline" size="sm">
                                مشاهده همه
                            </Button>
                        </Link>
                    </div>

                    {pendingQuestions.length > 0 ? (
                        <div className="space-y-3">
                            {pendingQuestions.slice(0, 3).map(question => (
                                <div key={question.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="font-medium text-sm mb-1 line-clamp-1">{question.title}</div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {question.category}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                            {new Date(question.createdAt).toLocaleDateString('fa-IR')}
                                        </span>
                                        </div>
                                        <Link href={`/lawyer-dashboard/questions?question=${question.id}`}>
                                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                                پاسخ دهید
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>سوالی برای پاسخ وجود ندارد</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };
    return (
        <div className="space-y-6">
            <SubscriptionBanner />
            {/* بخش خوشامدگویی */}
            <WelcomeSection/>

            {/* کارت‌های آماری */}
            <StatsCards/>

            {/* بخش فعالیت‌های اخیر */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentConsultations/>
                <RecentServices/>
            </div>
            <QuestionsWidget />
            {/* بخش خدمات برای وکلا */}
            <LawyerServicesSection />
            {/* بخش ابزارهای حرفه‌ای */}
            <ProfessionalTools/>
        </div>
    );
}