import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
}

export default function DateRangePicker({ startDate, endDate, setStartDate, setEndDate }: DateRangePickerProps) {
    const [startCalendarOpen, setStartCalendarOpen] = useState(false);
    const [endCalendarOpen, setEndCalendarOpen] = useState(false);

    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl w-full">
            <div className="flex-1 space-y-1.5 flex flex-col items-start overflow-hidden">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block px-3">시작일</label>
                <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-normal hover:bg-transparent h-8 px-3 py-1",
                                !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary/60 flex-shrink-0" />
                            {startDate ? format(startDate, "yyyy.MM.dd") : <span className="text-base text-gray-500">시작일 선택</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate || undefined}
                            onSelect={(date) => {
                                setStartDate(date || null);
                                setStartCalendarOpen(false);
                            }}
                            initialFocus
                            locale={ko}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="w-px bg-gray-200 my-2"></div>

            <div className="flex-1 space-y-1.5 flex flex-col items-start overflow-hidden">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block px-3">종료일</label>
                <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-normal hover:bg-transparent h-8 px-3 py-1",
                                !endDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary/60 flex-shrink-0" />
                            {endDate ? format(endDate, "yyyy.MM.dd") : <span className="text-base text-gray-500">종료일 선택</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="end">
                        <Calendar
                            mode="single"
                            selected={endDate || undefined}
                            onSelect={(date) => {
                                setEndDate(date || null);
                                setEndCalendarOpen(false);
                            }}
                            disabled={(date) => (startDate ? date < startDate : false)}
                            initialFocus
                            locale={ko}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
