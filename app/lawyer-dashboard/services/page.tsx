// app/lawyer-dashboard/services/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Briefcase, CheckCircle, X, Plus, Search, Filter } from "lucide-react";
import { useAuth } from "@/lib/api/useApi";

interface Service {
    id: string;
    userId: string;
    lawyerId: string;
    lawyerName: string;
    serviceName: string;
    description: string;
    price: number;
    status: "pending" | "in-progress" | "completed" | "cancelled";
    createdAt: string;
    completedAt?: string;
    invoiceNumber?: string;
    userName?: string;
}

export default function ServicesPage() {
    const { user: currentUser } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // شبیه‌سازی دریافت داده‌ها از API
        const fetchServices = async () => {
            setIsLoading(true);

            // در یک برنامه واقعی، اینجا از API استفاده می‌شود
            // برای حال حاضر، از داده‌های محلی استفاده می‌کنیم
            setTimeout(() => {
                if (currentUser && currentUser.services) {
                    setServices(currentUser.services as Service[]);
                    setFilteredServices(currentUser.services as Service[]);
                }
                setIsLoading(false);
            }, 500);
        };

        fetchServices();
    }, [currentUser]);

    useEffect(() => {
        // اعمال فیلترها
        let result = [...services];

        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                (s.userName && s.userName.toLowerCase().includes(term)) ||
                s.serviceName.toLowerCase().includes(term) ||
                s.description.toLowerCase().includes(term)
            );
        }

        setFilteredServices(result);
    }, [services, statusFilter, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
            case "in-progress":
                return <Badge className="bg-blue-100 text-blue-800">در حال انجام</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-800">انجام شده</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">لغو شده</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">درخواست‌های خدمات</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجو در خدمات..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="pending">در انتظار</option>
                        <option value="in-progress">در حال انجام</option>
                        <option value="completed">انجام شده</option>
                        <option value="cancelled">لغو شده</option>
                    </select>
                </div>
            </div>

            {filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">درخواست خدمتی یافت نشد</h3>
                        <p className="text-gray-500 mb-4">
                            {statusFilter !== "all" || searchTerm
                                ? "با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید"
                                : "شما هنوز هیچ درخواست خدمتی نداشته‌اید"
                            }
                        </p>
                        <Button
                            onClick={() => {
                                setStatusFilter("all");
                                setSearchTerm("");
                            }}
                            variant="outline"
                        >
                            حذف فیلترها
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredServices.map((service) => (
                        <Card key={service.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{service.serviceName}</div>
                                                <div className="text-sm text-gray-600">
                                                    {service.lawyerName}
                                                </div>
                                            </div>
                                        </div>

                                        {service.description && (
                                            <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {service.description}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(service.status)}
                                            <div className="text-sm font-medium">
                                                {service.price.toLocaleString()} تومان
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2">
                                        {service.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    شروع خدمت
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                                >
                                                    لغو درخواست
                                                </Button>
                                            </>
                                        )}

                                        {service.status === "in-progress" && (
                                            <Button
                                                size="sm"
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                تکمیل خدمت
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                        >
                                            جزئیات
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}