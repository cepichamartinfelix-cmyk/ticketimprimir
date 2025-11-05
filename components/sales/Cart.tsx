import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { User, Ticket } from '../../types';
import { generateTicket } from '../../services/api';
import CartItemComponent from './CartItem';
import TicketModal from './TicketModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CartProps {
  user: User;
}

const Cart: React.FC<CartProps> = ({ user }) => {
  const { cart, cartTotal, clearCart, itemCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);

  const handleGenerateSale = async () => {
    setError('');
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 7 || currentHour >= 23) {
      setError('Las ventas solo se pueden realizar between las 7:00 AM y las 11:00 PM.');
      return;
    }
    
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const ticket = await generateTicket(user.id, cart);
      setLastTicket(ticket);
      clearCart();
    } catch (err) {
      setError('No se pudo generar la venta.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePrintCart = () => {
    if (cart.length === 0) return;

    const printContent = `
      <html>
        <head>
          <title>Pre-Ticket</title>
          <style>
            /* Styles optimized for 80mm thermal printer */
            @page {
                size: 80mm auto; /* Set page size */
                margin: 0;
            }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 10pt; 
              color: #000;
              width: 288px; /* Approx 80mm width in pixels */
              padding: 10px;
            }
            .container { width: 100%; }
            h2 { font-size: 14pt; text-align: center; margin: 10px 0; }
            p { margin: 2px 0; font-size: 9pt;}
            hr { border: 0; border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 9pt; }
            th, td { padding: 2px 0; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .product-name {
                max-width: 150px; /* Adjust as needed */
                word-break: break-all;
            }
            .total-section { margin-top: 10px; }
            .total { font-weight: bold; font-size: 11pt; }
            .footer-note { text-align: center; font-size: 8pt; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Flujo POS</h2>
            <p style="text-align: center;">Pre-Ticket / Orden de Compra</p>
            <hr />
            <p>Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es })}</p>
            <p>Vendedor: ${user.name}</p>
            <hr />
            <table>
              <thead>
                <tr>
                  <th class="text-left">Cant</th>
                  <th class="text-left">Producto</th>
                  <th class="text-left">Hora</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${cart.map(item => `
                  <tr>
                    <td class="text-left">${item.quantity}</td>
                    <td class="text-left product-name">${item.product.name}</td>
                    <td class="text-left">${item.sellTime}:00</td>
                    <td class="text-right">$${(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <hr />
            <div class="total-section text-right">
              <p class="total">TOTAL: $${cartTotal.toFixed(2)}</p>
            </div>
            <hr />
            <p class="footer-note">*** NO ES UN COMPROBANTE FISCAL ***</p>
          </div>
        </body>
      </html>
    `;

    const WinPrint = window.open('', '', 'width=320,height=650');
    WinPrint?.document.write(printContent);
    WinPrint?.document.close();
    WinPrint?.focus();
    WinPrint?.print();
    WinPrint?.close();
  };


  return (
    <div className="bg-theme-card rounded-lg shadow-lg border border-theme-border h-full flex flex-col">
      <div className="p-4 border-b border-theme-border">
        <h2 className="text-xl font-bold text-theme-card-foreground">Carrito de Compras</h2>
        <p className="text-sm text-theme-card-foreground/70">{itemCount} items</p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <p className="text-center text-theme-card-foreground/60 pt-10">Tu carrito está vacío.</p>
        ) : (
          cart.map(item => <CartItemComponent key={item.id} item={item} />)
        )}
      </div>

      {cart.length > 0 && (
          <div className="p-4 border-t border-theme-border space-y-2">
            <div className="flex justify-between items-center text-xl font-bold mb-2">
                <span className="text-theme-card-foreground">Total:</span>
                <span className="text-theme-primary">${cartTotal.toFixed(2)}</span>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
            
            <button
              onClick={handleGenerateSale}
              disabled={isProcessing}
              className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Procesando...' : 'Generar Venta'}
            </button>
            <button
              onClick={handlePrintCart}
              disabled={cart.length === 0}
              className="w-full bg-theme-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-theme-accent disabled:opacity-50 transition-colors text-sm"
            >
              Imprimir Carrito
            </button>
            <button
              onClick={clearCart}
              className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors text-sm"
            >
              Vaciar Carrito
            </button>
          </div>
      )}
      {lastTicket && <TicketModal ticket={lastTicket} onClose={() => setLastTicket(null)} />}
    </div>
  );
};

export default Cart;