'use client';

import { useState, useEffect } from 'react';
import { ImagePlus, X, Calendar as CalendarIcon, MapPin, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLoadScript } from '@react-google-maps/api';
import PlaceAutocomplete from '@/components/upload/PlaceAutocomplete';
import BottomNav from '@/components/layout/BottomNav';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface DayAction {
    id: string;
    address: string;
    lat?: number;
    lng?: number;
    google_types?: string[];
}

interface DayPlan {
    day_number: number;
    title: string;
    description: string;
    actions: DayAction[];
    images: string[];
}

export default function CreatePostPage() {
    const router = useRouter();
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [dayPlans, setDayPlans] = useState<DayPlan[]>([{ day_number: 1, title: '', description: '', actions: [], images: [] }]);
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

    useEffect(() => {
        if (startDate && endDate && endDate >= startDate) {
            const daysDiff = differenceInDays(endDate, startDate) + 1;
            setDayPlans(prevPlans => {
                const newPlans: DayPlan[] = [];
                for (let i = 1; i <= daysDiff; i++) {
                    const existing = prevPlans.find(p => p.day_number === i);
                    if (existing) {
                        newPlans.push(existing);
                    } else {
                        newPlans.push({ day_number: i, title: '', description: '', actions: [], images: [] });
                    }
                }
                return newPlans;
            });
        }
    }, [startDate, endDate]);

    const processFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_DIM = 800;
                    let { width, height } = img;
                    if (width > height && width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    } else if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await processFile(file);
            setCoverImage(processed);
        }
    };

    const handleDayImageChange = async (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const currentImages = dayPlans[dayIndex].images || [];

        if (files.length + currentImages.length > 10) {
            alert('일정별 이미지는 최대 10장까지 업로드할 수 있습니다.');
            return;
        }

        const newProcessedImages = await Promise.all(files.map(processFile));
        setDayPlans(prev => {
            const updated = [...prev];
            updated[dayIndex] = {
                ...updated[dayIndex],
                images: [...(updated[dayIndex].images || []), ...newProcessedImages]
            };
            return updated;
        });
    };

    const removeDayImage = (dayIndex: number, imgIndex: number) => {
        setDayPlans(prev => {
            const updated = [...prev];
            updated[dayIndex] = {
                ...updated[dayIndex],
                images: updated[dayIndex].images.filter((_, i) => i !== imgIndex)
            };
            return updated;
        });
    };

    const updateDayPlan = (index: number, field: keyof DayPlan, value: string) => {
        setDayPlans(prevPlans => {
            const newPlans = [...prevPlans];
            newPlans[index] = { ...newPlans[index], [field]: value };
            return newPlans;
        });
    };

    const addAction = (dayIndex: number) => {
        setDayPlans(prevPlans => {
            const newPlans = [...prevPlans];
            const newDay = { ...newPlans[dayIndex], actions: [...(newPlans[dayIndex].actions || [])] };
            newDay.actions.push({ id: `${Date.now()}-${Math.random()}`, address: '' });
            newPlans[dayIndex] = newDay;
            return newPlans;
        });
    };

    const updateAction = (dayIndex: number, actionIndex: number, address: string, lat?: number, lng?: number, google_types?: string[]) => {
        setDayPlans(prevPlans => {
            const newPlans = [...prevPlans];
            const newDay = { ...newPlans[dayIndex], actions: [...newPlans[dayIndex].actions] };
            newDay.actions[actionIndex] = { ...newDay.actions[actionIndex], address, lat, lng, google_types };
            newPlans[dayIndex] = newDay;
            return newPlans;
        });
    };

    const handlePublish = async () => {
        if (!user || !coverImage || !title) return;
        setLoading(true);

        try {
            const postData = {
                author_id: user.id,
                title,
                caption,
                images: [coverImage],
                travel_start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
                travel_end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-16">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="w-10">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    새 일정 작성
                </h1>
                <div className="w-10 flex justify-end">
                    <button
                        onClick={handlePublish}
                        disabled={!coverImage || !title || loading}
                        className={`text-sm font-semibold transition-colors ${(!coverImage || !title || loading) ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:text-primary/80'}`}
                    >
                        {loading ? '...' : '공유'}
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-24 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:overflow-hidden md:h-fit">
                {/* Cover Image Area */}
                <div className="w-full bg-gray-50 border-b border-gray-100 p-4">
                    <div className={cn("flex items-center justify-center", !coverImage ? "h-64" : "")}>
                        {coverImage ? (
                            <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <img src={coverImage} alt="cover preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setCoverImage(null)}
                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <span className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wide">대표 커버</span>
                            </div>
                        ) : (
                            <label className="w-full max-w-md h-48 flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl border-2 border-dashed border-gray-300 cursor-pointer">
                                <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs font-semibold text-gray-500">커버 이미지 업로드</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Itinerary Data Area */}
                <div className="p-5 space-y-8">
                    {/* Title & Caption */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="여행 제목 (예: 3박 4일 도쿄 여행)"
                            className="w-full text-xl font-bold outline-none placeholder:text-gray-300 border-b border-transparent focus:border-primary pb-2 transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="어떤 여행이었나요? 간단한 소감을 남겨주세요."
                            className="w-full text-sm outline-none resize-none h-16 text-gray-600 placeholder:text-gray-300"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="flex-1 space-y-1.5 flex flex-col items-start overflow-hidden">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-3">시작일</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"ghost"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal hover:bg-transparent h-8 px-3 py-1",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary/60 flex-shrink-0" />
                                        {startDate ? format(startDate, "yyyy.MM.dd") : <span className="text-sm text-gray-500">시작일 선택</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate || undefined}
                                        onSelect={(date) => setStartDate(date || null)}
                                        initialFocus
                                        locale={ko}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-px bg-gray-200 my-2"></div>
                        <div className="flex-1 space-y-1.5 flex flex-col items-start overflow-hidden">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-3">종료일</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"ghost"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal hover:bg-transparent h-8 px-3 py-1",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary/60 flex-shrink-0" />
                                        {endDate ? format(endDate, "yyyy.MM.dd") : <span className="text-sm text-gray-500">종료일 선택</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100]" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={endDate || undefined}
                                        onSelect={(date) => setEndDate(date || null)}
                                        disabled={(date) => (startDate ? date < startDate : false)}
                                        initialFocus
                                        locale={ko}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Days Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800">일정 상세</h3>
                        </div>

                        <div className="space-y-3">
                            {dayPlans.map((day, idx) => (
                                <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] focus-within:border-primary/30 focus-within:shadow-md transition-all">
                                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20">
                                        <span className="text-sm font-extrabold text-primary">D{day.day_number}</span>
                                    </div>
                                    <div className="flex-1 space-y-4 pt-1">
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="주요 장소나 테마"
                                                className="w-full text-sm font-bold outline-none text-gray-800 placeholder:text-gray-300"
                                                value={day.title}
                                                onChange={(e) => updateDayPlan(idx, 'title', e.target.value)}
                                            />
                                            <textarea
                                                placeholder="무엇을 했는지 기록해보세요"
                                                className="w-full text-xs outline-none resize-none h-14 text-gray-500 placeholder:text-gray-300"
                                                value={day.description}
                                                onChange={(e) => updateDayPlan(idx, 'description', e.target.value)}
                                            />
                                        </div>

                                        {/* Day Images Area */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none min-h-[80px]">
                                            {day.images && day.images.map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                                    <img src={img} alt="day preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeDayImage(idx, imgIdx)}
                                                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white backdrop-blur-sm"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(day.images?.length || 0) < 10 && (
                                                <label className="flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border-2 border-dashed border-gray-200 cursor-pointer">
                                                    <Plus className="w-5 h-5 text-gray-300" />
                                                    <span className="text-[10px] text-gray-400 font-medium">사진</span>
                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleDayImageChange(idx, e)} />
                                                </label>
                                            )}
                                        </div>

                                        {/* Day Actions Area */}
                                        <div className="space-y-2 pt-2 border-t border-gray-100">
                                            {day.actions && day.actions.map((action, actionIdx) => (
                                                <div key={action.id} className="relative">
                                                    {isLoaded ? (
                                                        <PlaceAutocomplete
                                                            value={action.address}
                                                            onChange={(address, lat, lng, types) => updateAction(idx, actionIdx, address, lat, lng, types)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                                            <input
                                                                type="text"
                                                                placeholder="구글지도 로딩중..."
                                                                className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                                disabled
                                                                value={action.address}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => addAction(idx)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[10px] font-bold text-gray-500 transition-colors border border-dashed border-gray-200"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>장소 추가</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
