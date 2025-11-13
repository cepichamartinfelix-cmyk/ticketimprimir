import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedHour, setSelectedHour] = useState<number | ''>('');

  const availableHours = useMemo(() => {
    const currentHour = new Date().getHours();
    const hours = [];
    // Business hours are 7 to 23 (7 AM to 11 PM)
    for (let i = 7; i <= 23; i++) {
      if (i >= currentHour) {
        hours.push(i);
      }
    }
    return hours;
  }, []);

  useEffect(() => {
    if (availableHours.length > 0) {
      // Set default time to the next available hour if not already set
      if (selectedHour === '' || !availableHours.includes(selectedHour as number)) {
        setSelectedHour(availableHours[0]);
      }
    } else {
      setSelectedHour('');
    }
  }, [availableHours, selectedHour]);

  const handleAddToCart = () => {
    // Show alert for low stock but still allow adding to cart
    if (product.stock && product.stock <= 5) {
      window.alert(`¡Alerta de stock bajo! Quedan solo ${product.stock} unidades de "${product.name}".`);
    }

    if (selectedHour !== '') {
      addToCart(product, quantity, selectedHour);
      setQuantity(1);
    }
  };

  const isAddToCartDisabled = selectedHour === '' || availableHours.length === 0;

  return (
    <div 
        className={`bg-theme-card rounded-lg shadow-md overflow-hidden border ${product.isPromotional ? 'border-theme-accent ring-2 ring-theme-accent/50' : 'border-theme-border'} flex flex-col`}
        title={product.isPromotional ? product.promotionReason : ''}
    >
      {product.isPromotional && (
        <div className="bg-theme-accent text-white text-xs font-bold px-3 py-1 text-center">
            {product.promotionReason || '¡Promoción!'}
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-theme-card-foreground truncate">{product.name}</h3>
        <p className="text-lg font-bold text-theme-primary mt-1">${product.price.toFixed(2)}</p>
        <p className={`text-xs mt-1 ${product.stock !== undefined && product.stock <= 5 ? 'text-red-500 font-bold' : 'text-theme-foreground/60'}`}>
          Stock: {product.stock ?? 'N/A'}
        </p>
        <div className="mt-4 flex-grow"></div>
        
        <div className="space-y-2 mt-2">
            <div className="w-full">
                <label htmlFor={`time-${product.id}`} className="sr-only">Hora de venta</label>
                <select
                    id={`time-${product.id}`}
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    disabled={availableHours.length === 0}
                    className="w-full text-center bg-theme-input border border-theme-border rounded-md px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {availableHours.length > 0 ? (
                        availableHours.map(hour => (
                            <option key={hour} value={hour}>{`${hour}:00`}</option>
                        ))
                    ) : (
                        <option>No hay horas disponibles hoy</option>
                    )}
                </select>
            </div>
            <div className="flex items-center justify-between gap-2">
                <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-theme-input border border-theme-border rounded-md px-2 py-1"
                    min="1"
                    max="100"
                />
                <button
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled}
                    className="px-3 py-1 bg-theme-primary text-white text-sm font-medium rounded-md hover:bg-theme-accent transition-colors flex-grow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Añadir
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;