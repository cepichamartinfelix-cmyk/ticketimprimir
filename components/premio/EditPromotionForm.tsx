import React, { useState, useMemo } from 'react';
import { Promotion } from '../../types';

interface EditPromotionFormProps {
    promotion: Promotion;
    onSave: (promotionId: string, data: { reason: string; hour: number }) => Promise<void>;
    onCancel: () => void;
}

const EditPromotionForm: React.FC<EditPromotionFormProps> = ({ promotion, onSave, onCancel }) => {
    const [reason, setReason] = useState(promotion.reason);
    const [hour, setHour] = useState<number | ''>(promotion.hour);
    const [isSaving, setIsSaving] = useState(false);

    const availableHours = useMemo(() => {
        const currentHour = new Date().getHours();
        const hours = [];
        // Business hours are 7 to 23
        for (let i = 7; i <= 23; i++) {
            if (i >= currentHour) {
                hours.push(i);
            }
        }
        // Ensure the promotion's current hour is in the list, so it can be re-selected or viewed, even if it's in the past
        if (!hours.includes(promotion.hour)) {
            hours.unshift(promotion.hour);
            hours.sort((a,b) => a - b);
        }
        return hours;
    }, [promotion.hour]);

    const handleSave = async () => {
        if (!reason.trim() || hour === '') return;
        setIsSaving(true);
        await onSave(promotion.id, { reason, hour: hour as number });
        // isSaving will be set to false by the parent component re-rendering
    };

    return (
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-theme-background rounded-md">
            <div className="flex-grow w-full sm:w-auto">
                <p className="font-semibold text-sm text-theme-foreground mb-1">{promotion.productName}</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-theme-input border border-theme-border rounded-md p-2 focus:ring-theme-ring focus:outline-none"
                    placeholder="Razón de la promoción"
                />
            </div>
            <div className="w-full sm:w-48">
                 <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-sm bg-theme-input border border-theme-border rounded-md px-2 py-1.5 focus:ring-theme-ring focus:outline-none"
                >
                    {availableHours.map(h => (
                        <option key={h} value={h}>{`${h}:00 - ${h+1}:00`}</option>
                    ))}
                </select>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
                 <button onClick={onCancel} className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs font-medium rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                    Cancelar
                 </button>
                 <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 disabled:opacity-50">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                 </button>
            </div>
        </div>
    );
};

export default EditPromotionForm;
