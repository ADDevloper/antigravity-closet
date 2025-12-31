"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { getAllPlannedOutfits, getAllItems, ClothingItem, PlannedOutfit, addPlannedOutfit, deletePlannedOutfit } from "@/lib/db";
import AppWrapper from "@/components/layout/AppWrapper";
import DateDetailPanel from "@/components/calendar/DateDetailPanel";
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
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
    };

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
            <div className="space-y-6 relative min-h-screen">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-poppins font-bold text-3xl text-slate-900">Outfit Planner</h1>
                        <p className="text-slate-500 font-medium">Schedule your looks and stay organized</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="font-poppins font-bold text-lg min-w-[140px] text-center text-slate-800">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                        {weekDays.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 auto-rows-[100px] sm:auto-rows-[120px] md:auto-rows-[160px]">
                        {calendarDays.map((day, idx) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const dayPlans = plans.filter(p => p.date === dateKey);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        relative border-b border-r border-slate-100 p-2 transition-all cursor-pointer group
                                        ${!isCurrentMonth ? "bg-slate-50/50" : "bg-white"}
                                        ${isSelected ? "ring-2 ring-inset ring-purple-500 z-10" : "hover:bg-purple-50/30"}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold
                                            ${isTodayDate ? "bg-purple-600 text-white shadow-md" : isCurrentMonth ? "text-slate-700" : "text-slate-400"}
                                        `}>
                                            {format(day, "d")}
                                        </span>
                                        {dayPlans.length > 0 && (
                                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                {dayPlans.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Preview of Items */}
                                    <div className="mt-2 flex flex-wrap gap-1 content-start h-[calc(100%-1.5rem)] overflow-hidden">
                                        {dayPlans.flatMap(plan => plan.itemIds).slice(0, 4).map((itemId, i) => {
                                            const item = closetItems[itemId];
                                            if (!item) return null;
                                            return (
                                                <div key={`${dateKey}-${itemId}-${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-white">
                                                    <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                                </div>
                                            );
                                        })}
                                        {dayPlans.reduce((acc, p) => acc + p.itemIds.length, 0) > 4 && (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-500">
                                                +
                                            </div>
                                        )}

                                        {/* Hover Add Button (Desktop) */}
                                        {dayPlans.length === 0 && isCurrentMonth && (
                                            <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-purple-50 text-purple-600 rounded-full p-2 shadow-sm">
                                                    <Plus size={20} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Loading State Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-purple-600" size={48} />
                    </div>
                )}

                {/* Date Detail Panel */}
                {selectedDate && (
                    <>
                        {/* Backdrop for mobile */}
                        <div
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
                            onClick={() => setSelectedDate(null)}
                        />
                        <DateDetailPanel
                            date={selectedDate}
                            plans={plans.filter(p => p.date === format(selectedDate, "yyyy-MM-dd"))}
                            closetItems={closetItems}
                            onClose={() => setSelectedDate(null)}
                            onAddItems={() => setIsPickerOpen(true)}
                            onDeletePlan={handleDeletePlan}
                        />
                    </>
                )}

                {/* Closet Picker Modal */}
                {isPickerOpen && (
                    <ClosetPicker
                        items={itemsArray}
                        onSelect={handleItemsSelected}
                        onClose={() => setIsPickerOpen(false)}
                    />
                )}
            </div>
        </AppWrapper>
    );
}
