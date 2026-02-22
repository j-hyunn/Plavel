import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import type { User } from '@supabase/supabase-js';
import type { DayPlan } from '@/types';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function usePostUpload() {
    const router = useRouter();

    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [dayPlans, setDayPlans] = useState<DayPlan[]>([{ day_number: 1, title: '', description: '', actions: [], images: [] }]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/login');
            else setUser(session.user);
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
            updated[dayIndex] = { ...updated[dayIndex], images: [...newProcessedImages, ...(updated[dayIndex].images || [])] };
            return updated;
        });
    };

    const removeDayImage = (dayIndex: number, imgIndex: number) => {
        setDayPlans(prev => {
            const updated = [...prev];
            updated[dayIndex] = { ...updated[dayIndex], images: updated[dayIndex].images.filter((_, i) => i !== imgIndex) };
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

    const removeAction = (dayIndex: number, actionIndex: number) => {
        setDayPlans(prevPlans => {
            const newPlans = [...prevPlans];
            const newDay = { ...newPlans[dayIndex], actions: newPlans[dayIndex].actions.filter((_, i) => i !== actionIndex) };
            newPlans[dayIndex] = newDay;
            return newPlans;
        });
    };

    const handleDragEnd = (dayIndex: number, event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDayPlans(prev => {
                const updated = [...prev];
                const actions = [...updated[dayIndex].actions];
                const oldIndex = actions.findIndex(a => a.id === active.id);
                const newIndex = actions.findIndex(a => a.id === over.id);

                updated[dayIndex] = { ...updated[dayIndex], actions: arrayMove(actions, oldIndex, newIndex) };
                return updated;
            });
        }
    };

    const isFormValid = title.trim() !== '' && caption.trim() !== '' && startDate !== null && endDate !== null && dayPlans.every(day => day.title.trim() !== '' && day.description.trim() !== '');

    const handlePublish = async () => {
        if (!user || !isFormValid) return;
        setLoading(true);

        try {
            const postData = {
                author_id: user.id,
                title,
                caption,
                images: coverImage ? [coverImage] : [],
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

    return {
        coverImage,
        setCoverImage,
        title,
        setTitle,
        caption,
        setCaption,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        dayPlans,
        loading,
        isFormValid,
        handleCoverImageChange,
        handleDayImageChange,
        removeDayImage,
        updateDayPlan,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd,
        handlePublish,
    };
}
