"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { getAllPlannedOutfits, getAllItems, ClothingItem, PlannedOutfit, addPlannedOutfit, deletePlannedOutfit } from "@/lib/db";
import AppWrapper from "@/components/layout/AppWrapper";
import ClosetPicker from "@/components/calendar/ClosetPicker";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [plans, setPlans] = useState<PlannedOutfit[]>([]);
    const [closetItems, setClosetItems] = useState<Record<number, ClothingItem>>({});
    const [loading, setLoading] = useState(true);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [itemsArray, setItemsArray] = useState<ClothingItem[]>([]); // For Picker

    const loadData = useCallback(async () => {
        const [allPlans, allItems] = await Promise.all([
            getAllPlannedOutfits(),
            getAllItems()
        ]);

        setPlans(allPlans);
        setItemsArray(allItems);

        // Map items by ID for easy lookup
        const itemMap: Record<number, ClothingItem> = {};
        allItems.forEach(item => {
            if (item.id) itemMap[item.id] = item;
        });
        setClosetItems(itemMap);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleItemsSelected = async (itemIds: number[]) => {
        if (!selectedDate) return;

        const newPlan: PlannedOutfit = {
            date: format(selectedDate, "yyyy-MM-dd"),
            itemIds,
            createdAt: Date.now()
        };

        await addPlannedOutfit(newPlan);
        await loadData(); // Reload to reflect changes
    };

    const handleDeletePlan = async (id: number) => {
        if (confirm("Remove this outfit plan?")) {
            await deletePlannedOutfit(id);
            await loadData();
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <AppWrapper>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-[#1C1A2E] tracking-tight">Outfit Planner</h1>
                        <p className="text-[#94A3B8] font-medium text-[15px] mt-1">Curate and schedule your looks for the week ahead.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <button
                            onClick={prevMonth}
                            className="p-2.5 hover:bg-[#F8FAFC] rounded-xl text-[#64748B] transition-all hover:text-[#7C3AED]"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <h2 className="font-bold text-[16px] min-w-[140px] text-center text-[#1C1A2E] uppercase tracking-wider">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2.5 hover:bg-[#F8FAFC] rounded-xl text-[#64748B] transition-all hover:text-[#7C3AED]"
                        >
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* Calendar Container */}
                <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 border-b border-[#F1F5F9]">
                        {weekDays.map(day => (
                            <div key={day} className="py-5 text-center text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 auto-rows-[120px] sm:auto-rows-[140px] md:auto-rows-[180px]">
                        {calendarDays.map((day, idx) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const dayPlans = plans.filter(p => p.date === dateKey);
                            const totalItems = dayPlans.reduce((acc, p) => acc + p.itemIds.length, 0);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            // Shading logic for scheduled outfits
                            let bgColor = "bg-white";
                            if (!isCurrentMonth) {
                                bgColor = "bg-[#F8FAFC]/50";
                            } else if (totalItems === 1) {
                                bgColor = "bg-[#F5F3FF]"; // Very light purple
                            } else if (totalItems > 1) {
                                bgColor = "bg-[#EDE9FE]"; // Slightly deeper purple
                            }

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        setIsPickerOpen(true);
                                    }}
                                    className={`
                                        relative border-b border-r border-[#F1F5F9] p-3 transition-all cursor-pointer group
                                        ${bgColor}
                                        ${isSelected ? "ring-2 ring-inset ring-[#7C3AED] z-10" : "hover:bg-slate-50/50"}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-[14px] font-bold transition-all
                                            ${isTodayDate
                                                ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-200"
                                                : isCurrentMonth ? "text-[#1C1A2E]" : "text-[#CBD5E1]"}
                                        `}>
                                            {format(day, "d")}
                                        </span>

                                        {totalItems > 0 && (
                                            <div className="flex gap-1 items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                                                <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">
                                                    {totalItems === 1 ? '1 Look' : `${totalItems} Items`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items Preview */}
                                    <div className="mt-4 flex flex-wrap gap-2 content-start h-[calc(100%-3rem)] overflow-hidden">
                                        {dayPlans.flatMap(plan => plan.itemIds).slice(0, 3).map((itemId, i) => {
                                            const item = closetItems[itemId];
                                            if (!item) return null;
                                            return (
                                                <div
                                                    key={`${dateKey}-${itemId}-${i}`}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-[#F1F5F9] transition-transform group-hover:scale-105"
                                                >
                                                    <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                                </div>
                                            );
                                        })}
                                        {totalItems > 3 && (
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-[#64748B] border border-[#F1F5F9]">
                                                +{totalItems - 3}
                                            </div>
                                        )}

                                        {/* Hover Indicator */}
                                        {totalItems === 0 && isCurrentMonth && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 rounded-full bg-white text-[#7C3AED] flex items-center justify-center shadow-md border border-[#F1F5F9]">
                                                    <Plus size={20} strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Loading state, Panels and Modals remain handled by parent logic */}
                {loading && (
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
                            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.2em]">Syncing Calendar</span>
                        </div>
                    </div>
                )}

                {/* Outfit Architect (Picker) handles the planning flow directly */}
                {isPickerOpen && selectedDate && (
                    <ClosetPicker
                        items={itemsArray}
                        onSelect={handleItemsSelected}
                        onClose={() => {
                            setIsPickerOpen(false);
                            setSelectedDate(null);
                        }}
                        currentDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                )}
            </div>
        </AppWrapper>
    );
}
