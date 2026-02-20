'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useState, useEffect } from 'react';
import { ImagePlus, X, Calendar, MapPin, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

export default function CreatePostPage() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dayPlans, setDayPlans] = useState([{ day_number: 1, title: '', description: '' }]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
        };
        checkUser();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addDay = () => {
        setDayPlans([...dayPlans, { day_number: dayPlans.length + 1, title: '', description: '' }]);
    };

    const updateDayPlan = (index: number, field: string, value: string) => {
        const newPlans = [...dayPlans];
        (newPlans[index] as any)[field] = value;
        setDayPlans(newPlans);
    };

    const handlePublish = async () => {
        if (!user || !selectedImage || !title) return;
        setLoading(true);

        try {
            // In a real app, you would upload the image to Supabase Storage first.
            // For now, we'll use a placeholder or the base64 string (not recommended for production).
            const postData = {
                author_id: user.id,
                title,
                caption,
                cover_image_url: selectedImage, // Base64 for demo
                travel_start_date: startDate || null,
                travel_end_date: endDate || null,
            };

            await api.createPost(postData, dayPlans);
            router.push('/');
        } catch (error) {
            console.error('Error publishing post:', error);
            alert('게시 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            <main className=" pb-28 min-h-screen flex items-center justify-center p-4">
                <div className="instagram-card w-full max-w-[900px] overflow-hidden bg-white shadow-xl">
                    <div className="border-b border-[var(--border)] p-3 flex justify-between items-center bg-gray-50/50">
                        {selectedImage ? (
                            <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        ) : <div className="w-6" />}
                        <h2 className="font-semibold text-lg">여행 일정 공유하기</h2>
                        <button
                            onClick={handlePublish}
                            disabled={!selectedImage || !title || loading}
                            className={`text-[var(--primary-button)] font-semibold text-sm ${(!selectedImage || !title || loading) ? 'opacity-30 cursor-default' : 'hover:text-[var(--primary-button-hover)]'}`}
                        >
                            {loading ? '게시 중...' : '게시'}
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-[600px]">
                        {/* Image Area */}
                        <div className="flex-1 bg-gray-50 flex items-center justify-center relative border-r border-[var(--border)]">
                            {selectedImage ? (
                                <img src={selectedImage} alt="preview" className="w-full h-full object-contain" />
                            ) : (
                                <label className="flex flex-col items-center gap-4 cursor-pointer p-10 text-center">
                                    <ImagePlus className="w-16 h-16 text-gray-300" />
                                    <div className="space-y-1">
                                        <p className="text-lg font-medium text-gray-600">대표 사진을 업로드하세요</p>
                                        <p className="text-xs text-gray-400">여행의 느낌을 가장 잘 나타내는 사진이 좋아요</p>
                                    </div>
                                    <div className="mt-4 bg-[var(--primary-button)] text-white px-6 py-2 rounded-lg font-semibold text-sm">기기에서 선택</div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {/* Itinerary Data Area */}
                        <div className="w-full md:w-[350px] p-6 overflow-y-auto space-y-6 bg-white">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">여행 제목</label>
                                    <input
                                        type="text"
                                        placeholder="어디로 다녀오셨나요?"
                                        className="w-full text-lg font-bold outline-none border-b border-gray-100 pb-1 focus:border-[var(--primary-button)] transition-colors"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">간단한 설명</label>
                                    <textarea
                                        placeholder="여행에 대한 짧은 소감을 적어주세요"
                                        className="w-full text-sm outline-none bg-transparent resize-none h-20 border-b border-gray-100"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">시작일</label>
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <input type="text" placeholder="2024.01.01" className="bg-transparent outline-none text-xs w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">종료일</label>
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                                            <Calendar className="w-3 h-3 text-gray-300" />
                                            <input type="text" placeholder="2024.01.03" className="bg-transparent outline-none text-xs w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Day별 요약</h3>
                                    <button onClick={addDay} className="text-[var(--primary-button)] hover:bg-blue-50 p-1 rounded-full transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {dayPlans.map((day, idx) => (
                                        <div key={idx} className="relative pl-6 border-l border-gray-100">
                                            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-200" />
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Day ${day.day_number} 장소 또는 테마`}
                                                    className="w-full text-xs font-semibold outline-none bg-gray-50 p-2 rounded"
                                                    value={day.title}
                                                    onChange={(e) => updateDayPlan(idx, 'title', e.target.value)}
                                                />
                                                <textarea
                                                    placeholder="간단한 설명을 적어주세요"
                                                    className="w-full text-[10px] outline-none bg-transparent resize-none h-12 text-gray-500"
                                                    value={day.description}
                                                    onChange={(e) => updateDayPlan(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
