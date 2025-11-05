
import React, { useState } from 'react';
import { Product } from '../../types';
import { updateSingleProduct } from '../../services/api';

interface PremioProductCardProps {
  product: Product;
  onUpdate: (product: Product) => void;
}

const PremioProductCard: React.FC<PremioProductCardProps> = ({ product, onUpdate }) => {
  const [isPromotional, setIsPromotional] = useState(product.isPromotional ?? false);
  const [reason, setReason] = useState(product.promotionReason ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleToggle = () => {
    const newIsPromotional = !isPromotional;
    setIsPromotional(newIsPromotional);
    if (!newIsPromotional) {
      setReason('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedProduct = await updateSingleProduct(product.id, {
        isPromotional,
        promotionReason: isPromotional ? reason : undefined,
      });
      onUpdate(updatedProduct);
      setSuccess('¡Guardado!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Error al guardar.');
      console.error(e);
      setTimeout(() => setError(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-theme-card rounded-lg shadow-md overflow-hidden border ${isPromotional ? 'border-theme-accent ring-2 ring-theme-accent/50' : 'border-theme-border'} flex flex-col p-4`}>
      <h3 className="font-semibold text-sm text-theme-card-foreground truncate">{product.name}</h3>
      <p className="text-lg font-bold text-theme-primary mt-1">${product.price.toFixed(2)}</p>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
            <label htmlFor={`promo-${product.id}`} className="text-sm font-medium text-theme-card-foreground">
                Promocional
            </label>
            <div
                onClick={handleToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${isPromotional ? 'bg-theme-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPromotional ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </div>
            <input
                type="checkbox"
                id={`promo-${product.id}`}
                className="sr-only"
                checked={isPromotional}
                onChange={handleToggle}
                aria-label="Marcar como promocional"
            />
        </div>
        
        {isPromotional && (
          <div>
            <label htmlFor={`reason-${product.id}`} className="block text-xs font-medium text-theme-card-foreground/80 mb-1">
              Texto de Tooltip
            </label>
            <textarea
              id={`reason-${product.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full text-xs bg-theme-input border border-theme-border rounded-md p-2 focus:ring-theme-ring focus:outline-none"
              placeholder="Ej: ¡Nuevo y delicioso!"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full text-sm bg-theme-primary text-white font-bold py-2 px-4 rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
        {success && <p className="text-green-500 text-xs text-center" role="status">{success}</p>}
        {error && <p className="text-red-500 text-xs text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default PremioProductCard;
