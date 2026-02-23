import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { api } from '@/services/api';
import type { User } from '@supabase/supabase-js';
import type { DayPlan } from '@/types';
import { trackEvent } from '@/lib/gtag';
import { processImageFile } from '@/lib/images';
import { useDayPlans } from './useDayPlans';

export function usePostUpload() {
    const router = useRouter();

    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const {
        days: dayPlans,
        setDays: setDayPlans,
        updateDay: updateDayPlan,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd
    } = useDayPlans([{ day_number: 1, title: '', description: '', actions: [], images: [] }]);

    useEffect(() => {
        const checkUser = async () => {
            const session = await api.getSession();
            if (!session) router.push('/login');
            else setUser(session.user);
        };
        checkUser();
    }, [router]);

    useEffect(() => {
        if (startDate && endDate && endDate >= startDate) {
            const daysDiff = differenceInDays(endDate, startDate) + 1;
            setDayPlans(prevPlans => {
                const newPlans = [];
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
    }, [startDate, endDate, setDayPlans]);

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const processed = await processImageFile(file);
                setCoverImage(processed);
            } catch (err) {
                console.error('Cover image processing failed', err);
            }
        }
    };

    const handleDayImageChange = async (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const currentImages = dayPlans[dayIndex].images || [];

        if (files.length + currentImages.length > 10) {
            alert('일정별 이미지는 최대 10장까지 업로드할 수 있습니다.');
            return;
        }

        try {
            const newProcessedImages = await Promise.all(files.map(f => processImageFile(f)));
            setDayPlans(prev => {
                const updated = [...prev];
                updated[dayIndex] = {
                    ...updated[dayIndex],
                    images: [...newProcessedImages, ...(updated[dayIndex].images || [])]
                };
                return updated;
            });
        } catch (err) {
            console.error('Day image processing failed', err);
        }
    };

    const removeDayImage = useCallback((dayIndex: number, imgIndex: number) => {
        setDayPlans(prev => {
            const updated = [...prev];
            updated[dayIndex] = {
                ...updated[dayIndex],
                images: (updated[dayIndex].images || []).filter((_, i) => i !== imgIndex)
            };
            return updated;
        });
    }, [setDayPlans]);

    const isFormValid = title.trim() !== '' &&
        caption.trim() !== '' &&
        startDate !== null &&
        endDate !== null &&
        dayPlans.every(day => day.title.trim() !== '' && (day.description?.trim() || '') !== '');

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

            trackEvent('complete_upload', {
                total_days: dayPlans.length,
                images_count: dayPlans.reduce((acc, dp) => acc + (dp.images?.length || 0), coverImage ? 1 : 0)
            });

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
