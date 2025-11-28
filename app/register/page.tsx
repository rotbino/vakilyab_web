// app/register/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Label } from '@/components/radix/label';
import { Textarea } from '@/components/radix/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/radix/select';
import { Checkbox } from '@/components/radix/checkbox';
import { Badge } from '@/components/radix/badge';
import {
    User,
    Phone,
    Lock,
    Mail,
    MapPin,
    Briefcase,
    Star,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { provinces, specialties } from "@/lib/api/mockData";

export default function RegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        // مرحله 1: موبایل
        mobile: '',

        // مرحله 2: کد تایید
        verificationCode: '',

        // مرحله 3: اطلاعات پایه
        name: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: 'user', // 'user' یا 'lawyer'

        // اطلاعات اضافی برای وکلا
        email: '',
        specialty: '',
        experience: '',
        licenseNumber: '',
        about: '',
        province: '',
        city: '',
        address: '',
        consultationFee: '',

        // اطلاعات VIP برای وکلا
        isVIP: false,
        vipPlan: '',

        // دریافت اطلاعات بیشتر
        wantMoreInfo: true
    });

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // پاک کردن خطا برای این فیلد
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.mobile) {
                newErrors.mobile = "شماره موبایل را وارد کنید";
            } else if (!/^09[0-9]{9}$/.test(formData.mobile)) {
                newErrors.mobile = "شماره موبایل معتبر نیست";
            }
        }

        if (step === 2) {
            if (!formData.verificationCode) {
                newErrors.verificationCode = "کد تایید را وارد کنید";
            } else if (formData.verificationCode.length !== 5) {
                newErrors.verificationCode = "کد تایید باید 5 رقم باشد";
            }
        }

        if (step === 3) {
            if (!formData.name) newErrors.name = "نام را وارد کنید";
            if (!formData.lastName) newErrors.lastName = "نام خانوادگی را وارد کنید";
            if (!formData.password) newErrors.password = "رمز عبور را وارد کنید";
            if (formData.password.length < 6) newErrors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیست";
            }

            // اگر وکیل هست و اطلاعات بیشتری می‌خواهد
            if (formData.wantMoreInfo && formData.role === 'lawyer') {
                if (!formData.email) newErrors.email = "ایمیل را وارد کنید";
                if (!formData.specialty) newErrors.specialty = "تخصص را انتخاب کنید";
                if (!formData.experience) newErrors.experience = "سابقه کار را وارد کنید";
                if (!formData.licenseNumber) newErrors.licenseNumber = "شماره پروانه را وارد کنید";
                if (!formData.about) newErrors.about = "درباره خود را توضیح دهید";
                if (!formData.province) newErrors.province = "استان را انتخاب کنید";
                if (!formData.city) newErrors.city = "شهر را انتخاب کنید";
                if (!formData.address) newErrors.address = "آدرس را وارد کنید";
                if (!formData.consultationFee) newErrors.consultationFee = "هزینه مشاوره را وارد کنید";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendCode = () => {
        if (validateStep(1)) {
            setLoading(true);
            // شبیه‌سازی ارسال کد تایید
            setTimeout(() => {
                setLoading(false);
                setCurrentStep(2);
                alert(`کد تایید به شماره ${formData.mobile} ارسال شد`);
            }, 1000);
        }
    };

    const handleVerifyCode = () => {
        if (validateStep(2)) {
            setLoading(true);
            // شبیه‌سازی بررسی کد تایید
            setTimeout(() => {
                setLoading(false);
                setCurrentStep(3);
            }, 1000);
        }
    };

    const handleSubmit = () => {
        if (validateStep(3)) {
            setLoading(true);
            // شبیه‌سازی ثبت نام
            setTimeout(() => {
                setLoading(false);
                console.log("Registration data:", formData);
                alert("ثبت نام با موفقیت انجام شد");
                router.push("/login");
            }, 1000);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#ca2a30] mb-2">ثبت نام در وکیل‌یاب</h1>
                    <p className="text-gray-600">به جمع ما بپیوندید</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step
                                        ? 'bg-[#ca2a30] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-16 h-1 mx-2 ${
                                        currentStep > step ? 'bg-[#ca2a30]' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {/* Step 1: Mobile Number */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Phone className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">شماره موبایل خود را وارد کنید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        کد تایید به این شماره ارسال خواهد شد
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="mobile">شماره موبایل</Label>
                                    <Input
                                        id="mobile"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                                        placeholder="09123456789"
                                        className={errors.mobile ? "border-red-500" : ""}
                                    />
                                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                                </div>

                                <Button
                                    onClick={handleSendCode}
                                    className="w-full bg-[#ca2a30] hover:bg-[#b02529]"
                                    disabled={loading}
                                >
                                    {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Verification Code */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Shield className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">کد تایید را وارد کنید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        کد 5 رقمی به شماره {formData.mobile} ارسال شد
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="verificationCode">کد تایید</Label>
                                    <Input
                                        id="verificationCode"
                                        value={formData.verificationCode}
                                        onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                                        placeholder="12345"
                                        className={errors.verificationCode ? "border-red-500" : ""}
                                    />
                                    {errors.verificationCode && <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 ml-2" />
                                        مرحله قبل
                                    </Button>
                                    <Button
                                        onClick={handleVerifyCode}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={loading}
                                    >
                                        {loading ? 'در حال بررسی...' : 'تایید کد'}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        className="text-sm text-[#ca2a30] hover:underline"
                                    >
                                        ارسال مجدد کد
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: User Information */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <User className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">اطلاعات پایه</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        لطفاً اطلاعات خود را کامل کنید
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">نام</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className={errors.name ? "border-red-500" : ""}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="lastName">نام خانوادگی</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            className={errors.lastName ? "border-red-500" : ""}
                                        />
                                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="password">رمز عبور</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className={errors.password ? "border-red-500" : ""}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        className={errors.confirmPassword ? "border-red-500" : ""}
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>

                                <div>
                                    <Label>نقش شما</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="user"
                                                checked={formData.role === 'user'}
                                                onChange={(e) => handleInputChange("role", e.target.value)}
                                                className="text-[#ca2a30]"
                                            />
                                            <span>کاربر عادی</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="lawyer"
                                                checked={formData.role === 'lawyer'}
                                                onChange={(e) => handleInputChange("role", e.target.value)}
                                                className="text-[#ca2a30]"
                                            />
                                            <span>وکیل</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Checkbox for more information */}
                                {/*<div className="flex items-center gap-2">
                                    <Checkbox
                                        id="wantMoreInfo"
                                        checked={formData.wantMoreInfo}
                                        onCheckedChange={(checked) => handleInputChange("wantMoreInfo", checked)}
                                    />
                                    <Label htmlFor="wantMoreInfo" className="text-sm">
                                        {formData.role === 'lawyer'
                                            ? 'تمایل دارم اطلاعات بیشتری برای ثبت نام به عنوان وکیل وارد کنم'
                                            : 'تمایل دارم اطلاعات بیشتری وارد کنم'}
                                    </Label>
                                </div>*/}

                                {/* Additional fields for lawyers who want more info */}
                                {formData.wantMoreInfo && formData.role === 'lawyer' && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <h3 className="font-medium text-gray-900">اطلاعات تکمیلی وکالت</h3>

                                        <div>
                                            <Label htmlFor="email">ایمیل</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="specialty">تخصص</Label>
                                            <Select onValueChange={(value) => handleInputChange("specialty", value)}>
                                                <SelectTrigger className={errors.specialty ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="تخصص خود را انتخاب کنید" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {specialties.map(specialty => (
                                                        <SelectItem key={specialty} value={specialty}>
                                                            {specialty}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="experience">سابقه کار (سال)</Label>
                                            <Input
                                                id="experience"
                                                type="number"
                                                value={formData.experience}
                                                onChange={(e) => handleInputChange("experience", e.target.value)}
                                                className={errors.experience ? "border-red-500" : ""}
                                            />
                                            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="licenseNumber">شماره پروانه وکالت</Label>
                                            <Input
                                                id="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                                                className={errors.licenseNumber ? "border-red-500" : ""}
                                            />
                                            {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="about">درباره من</Label>
                                            <Textarea
                                                id="about"
                                                rows={3}
                                                value={formData.about}
                                                onChange={(e) => handleInputChange("about", e.target.value)}
                                                className={errors.about ? "border-red-500" : ""}
                                                placeholder="لطفاً اطلاعات بیشتری درباره خودتان وارد کنید"
                                            />
                                            {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="province">استان</Label>
                                                <Select onValueChange={(value) => handleInputChange("province", value)}>
                                                    <SelectTrigger className={errors.province ? "border-red-500" : ""}>
                                                        <SelectValue placeholder="استان" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {provinces.map(province => (
                                                            <SelectItem key={province.id} value={province.id}>
                                                                {province.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="city">شهر</Label>
                                                <Input
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                                    className={errors.city ? "border-red-500" : ""}
                                                />
                                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="address">آدرس</Label>
                                            <Textarea
                                                id="address"
                                                rows={2}
                                                value={formData.address}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                className={errors.address ? "border-red-500" : ""}
                                            />
                                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="consultationFee">هزینه مشاوره برای 15 دقیقه (تومان)</Label>
                                            <Input
                                                id="consultationFee"
                                                type="number"
                                                value={formData.consultationFee}
                                                onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                                                className={errors.consultationFee ? "border-red-500" : ""}
                                            />
                                            {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation buttons */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 ml-2" />
                                        مرحله قبل
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={loading}
                                    >
                                        {loading ? 'در حال ثبت نام...' : 'ثبت نام نهایی'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                    حساب کاربری دارید؟{' '}
                    <Link href="/login" className="text-[#ca2a30] hover:underline font-medium">
                        وارد شوید
                    </Link>
                </div>
            </div>
        </div>
    );
}