import React, { useState, useMemo } from 'react';
import { Product } from '../../types';

interface PremioProductCardProps {
  product: Product;
  onCreate: (data: { productId: string, productName: string, reason: string, hour: number }) => Promise<void>;
}

const PremioProductCard: React.FC<PremioProductCardProps> = ({ product, onCreate }) => {
  const [reason, setReason] = useState('');
  const [hour, setHour] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableHours = useMemo(() => {
    const currentHour = new Date().getHours();
    const hours = [];
    // Business hours are 7 to 23
    for (let i = 7; i <= 23; i++) {
        // Only show hours from the current hour onwards for today's promotions
        if (i >= currentHour) {
            hours.push(i);
        }
    }
    return hours;
  }, []);

  const handleCreate = async () => {
    if (!reason.trim() || hour === '') {
        setError('Razón y hora son requeridas.');
        setTimeout(() => setError(''), 3000);
        return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await onCreate({
        productId: product.id,
        productName: product.name,
        reason,
        hour: hour as number,
      });
      setSuccess('¡Creada!');
      setReason('');
      setHour('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Error al crear.');
      console.error(e);
      setTimeout(() => setError(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-theme-card rounded-lg shadow-md overflow-hidden border border-theme-border flex flex-col p-4 space-y-3">
      <h3 className="font-semibold text-sm text-theme-card-foreground truncate">{product.name}</h3>
      <p className="text-lg font-bold text-theme-primary">${product.price.toFixed(2)}</p>
      
      <div className="space-y-2">
          <div>
            <label htmlFor={`reason-${product.id}`} className="block text-xs font-medium text-theme-card-foreground/80 mb-1">
              Razón de la promoción
            </label>
            <textarea
              id={`reason-${product.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full text-xs bg-theme-input border border-theme-border rounded-md p-2 focus:ring-theme-ring focus:outline-none"
              placeholder="Ej: ¡Happy Hour!"
            />
          </div>
          <div>
            <label htmlFor={`hour-${product.id}`} className="block text-xs font-medium text-theme-card-foreground/80 mb-1">
              Hora de la promoción
            </label>
            <select
                id={`hour-${product.id}`}
                value={hour}
                onChange={(e) => setHour(e.target.value ? Number(e.target.value) : '')}
                disabled={availableHours.length === 0}
                className="w-full text-sm bg-theme-input border border-theme-border rounded-md px-2 py-1.5 focus:ring-theme-ring focus:outline-none disabled:opacity-50"
            >
                <option value="">Seleccionar hora</option>
                {availableHours.length > 0 ? (
                    availableHours.map(h => (
                        <option key={h} value={h}>{`${h}:00 - ${h+1}:00`}</option>
                    ))
                ) : (
                    <option disabled>No hay horas disponibles hoy</option>
                )}
            </select>
          </div>
      </div>

      <div className="flex-grow"></div>

        <button
          onClick={handleCreate}
          disabled={isSaving || availableHours.length === 0}
          className="w-full text-sm bg-theme-primary text-white font-bold py-2 px-4 rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Creando...' : 'Crear Promoción'}
        </button>
        {success && <p className="text-green-500 text-xs text-center" role="status">{success}</p>}
        {error && <p className="text-red-500 text-xs text-center" role="alert">{error}</p>}
    </div>
  );
};

export default PremioProductCard;