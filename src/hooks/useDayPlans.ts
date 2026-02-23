import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { DayPlan, DayAction } from '@/types';

export function useDayPlans(initialDays: DayPlan[] = [{ day_number: 1, title: '', description: '', actions: [], images: [] }]) {
    const [days, setDays] = useState<DayPlan[]>(initialDays);

    const updateDay = useCallback((index: number, field: keyof DayPlan, value: any) => {
        setDays(prev => {
            const arr = [...prev];
            arr[index] = { ...arr[index], [field]: value };
            return arr;
        });
    }, []);

    const addAction = useCallback((dayIndex: number) => {
        setDays(prev => {
            const arr = [...prev];
            const newDay = { ...arr[dayIndex], actions: [...(arr[dayIndex].actions || [])] };
            newDay.actions.push({ id: crypto.randomUUID(), address: '', time: '' });
            arr[dayIndex] = newDay;
            return arr;
        });
    }, []);

    const updateAction = useCallback((dayIdx: number, actionIdx: number, updates: Partial<DayAction>) => {
        setDays(prev => {
            const arr = [...prev];
            const newDay = { ...arr[dayIdx], actions: [...arr[dayIdx].actions] };
            newDay.actions[actionIdx] = { ...newDay.actions[actionIdx], ...updates };
            arr[dayIdx] = newDay;
            return arr;
        });
    }, []);

    const removeAction = useCallback((dayIdx: number, actionIdx: number) => {
        setDays(prev => {
            const arr = [...prev];
            const newDay = { ...arr[dayIdx], actions: arr[dayIdx].actions.filter((_, i) => i !== actionIdx) };
            arr[dayIdx] = newDay;
            return arr;
        });
    }, []);

    const handleDragEnd = useCallback((dayIndex: number, event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDays(prev => {
                const arr = [...prev];
                const actions = [...arr[dayIndex].actions];
                const oldIndex = actions.findIndex(a => a.id === active.id);
                const newIndex = actions.findIndex(a => a.id === over.id);

                arr[dayIndex] = { ...arr[dayIndex], actions: arrayMove(actions, oldIndex, newIndex) };
                return arr;
            });
        }
    }, []);

    return {
        days,
        setDays,
        updateDay,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd
    };
}
