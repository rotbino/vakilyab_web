// app/lawyer-dashboard/consultation-pricing/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import ConsultationPricingManager from "@/app/lawyer-dashboard/ConsultationPricingManager";

export default function ConsultationPricingPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">مدیریت قیمت‌های مشاوره</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-6">
                        در این صفحه می‌توانید قیمت‌های مشاوره خود را برای مدت‌های مختلف تنظیم کنید.
                        این قیمت‌ها در صفحه پروفایل شما به کاربران نمایش داده می‌شود.
                    </p>
                </CardContent>
            </Card>

            <ConsultationPricingManager />
        </div>
    );
}