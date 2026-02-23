import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import type { MyPlan } from '@/types/plan';
import { useDayPlans } from './useDayPlans';

export function usePlanEditor(initialPlan?: MyPlan) {
    const [title, setTitle] = useState(initialPlan?.title || '');
    const [startDate, setStartDate] = useState<Date | null>(initialPlan?.startDate ? new Date(initialPlan.startDate) : null);
    const [endDate, setEndDate] = useState<Date | null>(initialPlan?.endDate ? new Date(initialPlan.endDate) : null);

    const {
        days,
        setDays,
        updateDay,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd
    } = useDayPlans(initialPlan?.days || [{ day_number: 1, title: '', description: '', actions: [] }]);

    useEffect(() => {
        if (startDate && endDate && endDate >= startDate) {
            const daysDiff = differenceInDays(endDate, startDate) + 1;
            setDays(prevPlans => {
                const newPlans = [];
                for (let i = 1; i <= daysDiff; i++) {
                    const existing = prevPlans.find(p => p.day_number === i);
                    if (existing) {
                        newPlans.push(existing);
                    } else {
                        newPlans.push({ day_number: i, title: '', description: '', actions: [] });
                    }
                }
                return newPlans;
            });
        }
    }, [startDate, endDate, setDays]);

    const isFormValid = title.trim() !== '';

    return {
        title, setTitle,
        startDate, setStartDate,
        endDate, setEndDate,
        days, setDays,
        updateDay,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd,
        isFormValid
    };
}
