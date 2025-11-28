// app/questions/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Textarea } from '@/components/radix/textarea';
import { User, Clock, MessageSquare, ThumbsUp, Check, Send } from 'lucide-react';
import { useLegalQuestion, useAddAnswer } from '@/lib/api/useApi';
import { useAuth } from '@/lib/api/useApi';
import Link from 'next/link';
import AnswerCard from "@/app/questions/AnswerCard";

export default function LegalQuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { data: question, isLoading } = useLegalQuestion(params.id as string);
    const addAnswerMutation = useAddAnswer();

    const [newAnswer, setNewAnswer] = useState('');
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

    const handleSubmitAnswer = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!newAnswer.trim()) {
            alert('لطفاً پاسخ خود را وارد کنید');
            return;
        }

        if (user?.role !== 'lawyer') {
            alert('فقط وکلا می‌توانند به سوالات پاسخ دهند');
            return;
        }

        addAnswerMutation.mutate({
            questionId: params.id as string,
            lawyerId: user.id,
            lawyerName: `${user.name} ${user.lastName}`,
            content: newAnswer
        }, {
            onSuccess: () => {
                setNewAnswer('');
            }
        });
    };

    const handleAcceptAnswer = (answerId: string) => {
        // در اینجا باید API برای قبول کردن پاسخ فراخوانی شود
        // برای سادگی، فقط state را به‌روز می‌کنیم
        setSelectedAnswerId(answerId);
        alert('پاسخ به عنوان بهترین پاسخ انتخاب شد');
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

    if (!question) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">سوال یافت نشد</h3>
                        <p className="text-gray-600 mb-4">
                            سوال مورد نظر یافت نشد یا حذف شده است.
                        </p>
                        <Link href="/questions">
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                بازگشت به لیست سوالات
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isQuestionOwner = user?.id === question.userId;
    const isLawyer = user?.role === 'lawyer';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/questions">
                        <Button variant="outline" className="flex items-center gap-2">
                            ← بازگشت به لیست سوالات
                        </Button>
                    </Link>
                </div>

                {/* Question Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-2xl">{question.title}</CardTitle>
                            <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    question.isAnswered
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {question.isAnswered ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {question.category}
                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 mb-6">{question.content}</p>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{question.userName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(question.createdAt).toLocaleDateString('fa-IR')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Answers Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            پاسخ‌ها ({question.answers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {question.answers.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">هنوز پاسخی ثبت نشده</h3>
                                <p className="text-gray-600">
                                    {isLawyer ? 'شما می‌توانید اولین پاسخ را ثبت کنید.' : 'به زودی توسط وکلا پاسخ داده خواهد شد.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {question.answers.map((answer) => (
                                    <AnswerCard
                                        key={answer.id}
                                        answer={answer}
                                        isQuestionOwner={isQuestionOwner}
                                        onAcceptAnswer={handleAcceptAnswer}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Answer Form - Only for Lawyers */}
                {isLawyer && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ثبت پاسخ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="پاسخ خود را اینجا بنویسید..."
                                rows={4}
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                className="mb-4"
                            />
                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={addAnswerMutation.isPending}
                                className="bg-[#ca2a30] hover:bg-[#b02529] flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {addAnswerMutation.isPending ? 'در حال ثبت...' : 'ثبت پاسخ'}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}