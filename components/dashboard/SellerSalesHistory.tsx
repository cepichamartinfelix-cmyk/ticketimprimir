import React from 'react';
import { Ticket } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SellerSalesHistoryProps {
  tickets: Ticket[];
}

const SellerSalesHistory: React.FC<SellerSalesHistoryProps> = ({ tickets }) => {
  if (tickets.length === 0) {
    return <p className="text-theme-card-foreground/70">Este vendedor no tiene ventas completadas.</p>;
  }

  return (
    <div className="overflow-y-auto max-h-96 relative">
      <table className="min-w-full divide-y divide-theme-border">
        <thead className="bg-theme-card sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Ticket ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Hora</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-theme-card divide-y divide-theme-border">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-card-foreground">{ticket.id.slice(-8)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{format(ticket.createdAt, "dd MMM yyyy", { locale: es })}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{format(ticket.createdAt, "HH:mm", { locale: es })}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-theme-card-foreground">${ticket.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerSalesHistory;
