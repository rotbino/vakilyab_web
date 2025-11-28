'use client';

import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/radix/tabs';
import {
    MapPin,
    Briefcase,
    Phone,
    Mail,
    Star,
    Eye,
    Clock,
    Award,
    MessageCircle,
    CheckCircle,
    CreditCard,
    Crown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LawyerList } from '@/lib/api/types';
import TimeSlotSelector from '@/app/lawyer-dashboard/TimeSlotSelector';
import {useLawyer, useReviews, useQAPairs} from "@/lib/api/useApi";
import {useTimeSlots} from "@/lib/api/useApi";
import {useAuth} from "@/lib/api/useApi";

interface LawyerDetailPageProps {
    params: Promise<{ id: string }>;
}

interface Service {
    id: string;
    name: string;
    price: number;
}

interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

const services: Service[] = [
    { id: "1", name: "تنظیم لایحه", price: 1149000 },
    { id: "2", name: "تنظیم اظهارنامه", price: 749000 },
    { id: "3", name: "تنظیم دادخواست", price: 1459000 },
    { id: "4", name: "تنظیم قرارداد", price: 2449000 },
    { id: "5", name: "بررسی کامل مدارک", price: 615000 },
    { id: "6", name: "بررسی مدارک(تا 3صفحه)", price: 390000 },
    { id: "7", name: "بررسی و تفهیم رای", price: 349000 },
    { id: "8", name: "صلح نامه", price: 2000000 }
];

const consultationOptions = [
    { id: "15min", name: "15 دقیقه", price: 150000 },
    { id: "30min", name: "30 دقیقه", price: 250000 },
    { id: "45min", name: "45 دقیقه", price: 350000 },
    { id: "60min", name: "60 دقیقه", price: 450000 }
];

export default function LawyerDetailPage({ params }: LawyerDetailPageProps) {
    const { id } = React.use(params);
    const router = useRouter();
    const { data: lawyer, isLoading, error } = useLawyer(id);
    const { data: timeSlots, refetch } = useTimeSlots(id);
    const { data: reviews } = useReviews(id);
    const { data: qaPairs } = useQAPairs(id);
    const { user, isAuthenticated } = useAuth();

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [showContactInfo, setShowContactInfo] = useState<boolean>(false);

    // Check if user is a lawyer
    const isLawyer = user?.role === 'lawyer';

    // Check subscription status
    const isSubscriptionActive = lawyer?.subscription ?
        new Date(lawyer.subscription.expiryDate) > new Date() : false;

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    const toggleService = (serviceId: string) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const calculateTotal = () => {
        const servicesTotal = selectedServices.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            return total + (service?.price || 0);
        }, 0);

        return servicesTotal;
    };

    const handlePayment = () => {
        if (!isAuthenticated) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            router.push('/login');
            return;
        }

        alert(`پرداخت مبلغ ${calculateTotal().toLocaleString()} تومان`);
        setShowContactInfo(true);
    };

    const handleConsultationRequest = () => {
        if (!isAuthenticated) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            router.push('/login');
            return;
        }

        router.push(`/${lawyer?.id}/booking`);
    };

    // تابع برای رندر کردن نوار تاج‌ها
    const renderCrownBar = () => {
        const steps = lawyer?.subscription?.steps || 0;
        const totalCrowns = 5;

        return (
            <div className="flex gap-1 justify-between">
                <div className={"flex gap-1"}>
                    {Array.from({ length: totalCrowns }).map((_, index) => (
                        <Crown
                            key={index}
                            className={`w-4 h-4 ${
                                index < steps
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>

                {/* نمایش نشان وکیل ویژه برای پلن یکساله */}
                {isSubscriptionActive && lawyer?.subscription?.isVIP && (
                    <Badge className="bg-yellow-500 text-white text-xs font-medium py-0.5 px-2 rounded-full">
                        وکیل ویژه
                    </Badge>
                )}
            </div>
        );
    };

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

    if (error || !lawyer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <Award className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                        <p className="text-gray-600 mb-4">{error?.message || "وکیل مورد نظر یافت نشد"}</p>
                        <Button onClick={() => window.location.reload()} className="bg-[#ca2a30] hover:bg-[#b02529]">
                            تلاش مجدد
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="outline" className="flex items-center gap-2">
                            ← بازگشت به لیست وکلا
                        </Button>
                    </Link>
                </div>

                {/* Header Card */}
                <Card className="mb-8 overflow-hidden shadow-lg">
                    <div className="relative h-64 bg-gradient-to-r from-orange-500 to-orange-600">
                        <div className="absolute inset-0 bg-black opacity-20"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                    <Image
                                        src={lawyer.profileImage}
                                        alt={`${lawyer.name} ${lawyer.lastName}`}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {lawyer.name} {lawyer.lastName}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-white text-orange-600 hover:bg-orange-50">
                                            {lawyer.specialty}
                                        </Badge>
                                        <div className="flex items-center gap-1 bg-white/80 text-gray-800 px-2 py-1 rounded-full text-sm">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            {lawyer.rating}
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/80 text-gray-800 px-2 py-1 rounded-full text-sm">
                                            <MapPin className="w-4 h-4" />
                                            {lawyer.city}
                                        </div>
                                    </div>

                                    {/* نمایش وضعیت اشتراک */}
                                    {isSubscriptionActive && (
                                        <div className="mt-2">
                                            {renderCrownBar()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Me - تمام عرض */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-orange-500" />
                                    درباره من
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    {lawyer.about}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Consultation Card - برای موبایل بالاتر */}
                        <Card className="lg:hidden">
                            <CardHeader>
                                <CardTitle className="text-orange-700">درخواست مشاوره</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {consultationOptions.map(option => (
                                        <div key={option.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                                            <span className="font-medium">{option.name}</span>
                                            <span className="text-sm font-medium">{option.price.toLocaleString()} تومان</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleConsultationRequest}
                                    className="w-full bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    درخواست مشاوره
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Services - تمام عرض */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-orange-500" />
                                    خدمات و قیمت‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {services.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => toggleService(service.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedServices.includes(service.id)
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                    selectedServices.includes(service.id)
                                                        ? "border-orange-500 bg-orange-500"
                                                        : "border-gray-400"
                                                }`}>
                                                    {selectedServices.includes(service.id) && (
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{service.name}</span>
                                                        <span className="text-sm font-medium">
                                                            {service.price.toLocaleString()} تومان
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedServices.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-medium">مجموع:</span>
                                            <span className="text-lg font-bold text-orange-600">
                                                {selectedServices.reduce((total, serviceId) => {
                                                    const service = services.find(s => s.id === serviceId);
                                                    return total + (service?.price || 0);
                                                }, 0).toLocaleString()} تومان
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handlePayment}
                                            className="w-full bg-orange-500 hover:bg-orange-600"
                                        >
                                            پرداخت و دریافت اطلاعات تماس
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>



                        {/* Contact Information */}
                        {showContactInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-orange-500" />
                                        اطلاعات تماس
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">شماره تماس</div>
                                            <div className="font-medium">{lawyer.mobile}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">شماره همراه</div>
                                            <div className="font-medium">{lawyer.mobile}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">آدرس دفتر</div>
                                            <div className="font-medium">{lawyer.address}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-orange-500" />
                                    آمار پروفایل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">تعداد بازدید</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {lawyer.views.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">سابقه کاری</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {lawyer.experience} سال
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">امتیاز</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        {lawyer.rating}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Consultation Card - برای دسکتاپ */}
                        <Card className="hidden lg:block">
                            <CardHeader>
                                <CardTitle className="text-orange-700">درخواست مشاوره</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {consultationOptions.map(option => (
                                        <div key={option.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                                            <span className="font-medium">{option.name}</span>
                                            <span className="text-sm font-medium">{option.price.toLocaleString()} تومان</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleConsultationRequest}
                                    className="w-full bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    درخواست مشاوره
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Time Slot Selection - Full width at the bottom */}
                {!isLawyer && (
                    <div className="mt-8">
                        <TimeSlotSelector
                            lawyerId={lawyer.id}
                            timeSlots={timeSlots || []}
                            onTimeSlotSelect={setSelectedTimeSlot}
                            selectedTimeSlot={selectedTimeSlot}
                        />
                    </div>
                )}
                {/* Reviews and Q&A - تمام عرض */}
                <Card className="lg:col-span-3 mt-4 p-4">
                    <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="reviews">نظرات کاربران</TabsTrigger>
                            <TabsTrigger value="qa">سوالات و پاسخ‌ها</TabsTrigger>
                        </TabsList>
                        <TabsContent value="reviews" className="space-y-4">
                            {reviews?.map(review => (
                                <div key={review.id} className="border-b pb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <span className="font-medium">{review.userName}</span>
                                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('fa-IR')}</span>
                                    </div>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            ))}
                            {(!reviews || reviews.length === 0) && (
                                <p className="text-gray-500 text-center py-4">هنوز نظری ثبت نشده است</p>
                            )}
                        </TabsContent>
                        <TabsContent value="qa" className="space-y-4">
                            {qaPairs?.map(qa => (
                                <div key={qa.id} className="border-b pb-4">
                                    <div className="mb-2">
                                        <div className="font-medium text-gray-900 mb-1">سوال از {qa.askedBy}</div>
                                        <p className="text-gray-700">{qa.question}</p>
                                        <div className="text-sm text-gray-500">{new Date(qa.askedAt).toLocaleDateString('fa-IR')}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="font-medium text-gray-900 mb-1">پاسخ وکیل</div>
                                        <p className="text-gray-700">{qa.answer}</p>
                                        <div className="text-sm text-gray-500">{new Date(qa.answeredAt).toLocaleDateString('fa-IR')}</div>
                                    </div>
                                </div>
                            ))}
                            {(!qaPairs || qaPairs.length === 0) && (
                                <p className="text-gray-500 text-center py-4">هنوز سوالی ثبت نشده است</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}