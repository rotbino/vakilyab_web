"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { Button } from "@/components/radix/button";
import { FileText, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/api/useApi";

export default function UserServicesPage() {
    const { user: currentUser } = useAuth();

    // محاسبه خدمات فعال و تکمیل شده
    const activeServices = currentUser?.services?.filter(s => s.status === 'in-progress') || [];
    const completedServices = currentUser?.services?.filter(s => s.status === 'completed') || [];
    const pendingServices = currentUser?.services?.filter(s => s.status === 'pending') || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">خدمات دریافتی</h1>
                <div className="text-sm text-gray-600">
                    {currentUser?.services?.length || 0} درخواست
                </div>
            </div>

            {/* خدمات در حال انجام */}
            {activeServices.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#ca2a30]" />
                            خدمات در حال انجام
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeServices.map((service) => (
                            <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{service.serviceName}</div>
                                    <div className="text-sm text-gray-600 mt-1">{service.lawyerName}</div>
                                    {service.description && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            {service.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        درخواست در: {new Date(service.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className="bg-blue-100 text-blue-800">
                                        در حال انجام
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {service.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* خدمات در انتظار */}
            {pendingServices.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            خدمات در انتظار
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingServices.map((service) => (
                            <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{service.serviceName}</div>
                                    <div className="text-sm text-gray-600 mt-1">{service.lawyerName}</div>
                                    {service.description && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            {service.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        درخواست در: {new Date(service.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        در انتظار
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {service.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* خدمات تکمیل شده */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        خدمات تکمیل شده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {completedServices.length > 0 ? (
                        <div className="space-y-4">
                            {completedServices.map((service) => (
                                <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-lg">{service.serviceName}</div>
                                        <div className="text-sm text-gray-600 mt-1">{service.lawyerName}</div>
                                        {service.description && (
                                            <div className="text-sm text-gray-700 mt-2">
                                                {service.description}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            درخواست در: {new Date(service.createdAt).toLocaleDateString('fa-IR')}
                                            {service.completedAt && (
                                                <span className="mr-2">
                                                    • تکمیل در: {new Date(service.completedAt).toLocaleDateString('fa-IR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <Badge className="bg-green-100 text-green-800">
                                            تکمیل شده
                                        </Badge>
                                        <div className="text-lg font-bold">
                                            {service.price.toLocaleString()} تومان
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">شما تا کنون هیچ خدمتی دریافت نکرده‌اید</p>
                            <Link href="/app/lawyers" className="inline-block">
                                <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                    مشاهده وکلا
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}