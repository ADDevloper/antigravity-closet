import { ChevronDown, ChevronUp } from 'lucide-react';

// Proper TypeScript interfaces
interface AccordionItemProps {
    id: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    children: React.ReactNode;
    openSection: string | null;
    toggleSection: (id: string) => void;
}

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    description?: string;
}

// Accordion Item Component
export function AccordionItem({ id, icon: Icon, title, children, openSection, toggleSection }: AccordionItemProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 font-bold text-slate-800">
                    <Icon size={20} className="text-purple-600" />
                    {title}
                </div>
                {openSection === id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            {openSection === id && (
                <div className="p-5 pt-0 border-t border-slate-50">
                    <div className="pt-5 space-y-6">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

// Toggle Switch Component
export function Toggle({ label, checked, onChange, description }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="pr-4">
                <p className="font-bold text-sm text-slate-900">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-purple-500' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </button>
        </div>
    );
}
