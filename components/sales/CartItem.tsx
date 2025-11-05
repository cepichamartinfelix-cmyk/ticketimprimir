
import React from 'react';
import { CartItem } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface CartItemProps {
  item: CartItem;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4">
      <div className="flex-grow">
        <p className="font-semibold text-sm text-theme-card-foreground truncate">{item.product.name}</p>
        <p className="text-xs text-theme-card-foreground/70">${item.product.price.toFixed(2)} @ {item.sellTime}:00</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
          className="w-14 text-center bg-theme-input border border-theme-border rounded-md px-1 py-0.5 text-sm"
          min="1"
          max="100"
        />
        <p className="w-20 text-right font-medium text-theme-card-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-red-500 hover:text-red-700 font-bold text-lg"
        aria-label="Remove item"
      >
        &times;
      </button>
    </div>
  );
};

export default CartItemComponent;
