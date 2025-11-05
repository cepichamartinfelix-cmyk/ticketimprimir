
import React, { useState } from 'react';
import { Ticket } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SalesTableProps {
  tickets: Ticket[];
  onCancelTicket: (ticketId: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ tickets, onCancelTicket }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 10;

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
    const totalPages = Math.ceil(tickets.length / ticketsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-theme-border">
        <thead className="bg-theme-card">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Ticket ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Total</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-theme-card-foreground/70 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-theme-card divide-y divide-theme-border">
          {currentTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-card-foreground">{ticket.id.slice(-8)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{ticket.userName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{format(ticket.createdAt, "dd MMM yyyy, HH:mm", { locale: es })}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {ticket.status === 'COMPLETED' ? 'Completado' : 'Anulado'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-theme-card-foreground">${ticket.total.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                {ticket.status === 'COMPLETED' && (
                    <button
                        onClick={() => onCancelTicket(ticket.id)}
                        className="text-red-600 hover:text-red-900"
                    >
                        Anular
                    </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="py-3 flex items-center justify-between border-t border-theme-border">
          <div className="text-sm text-theme-foreground/70">
              Página {currentPage} de {totalPages}
          </div>
          <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-theme-border bg-theme-card text-sm font-medium text-theme-foreground/70 hover:bg-theme-background disabled:opacity-50">
                      Anterior
                  </button>
                  <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-theme-border bg-theme-card text-sm font-medium text-theme-foreground/70 hover:bg-theme-background disabled:opacity-50">
                      Siguiente
                  </button>
              </nav>
          </div>
      </div>
    </div>
  );
};

export default SalesTable;
