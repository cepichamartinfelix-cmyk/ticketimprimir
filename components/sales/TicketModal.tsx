import React, { useRef } from 'react';
import { Ticket } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketModalProps {
    ticket: Ticket;
    onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = ticketRef.current;
        if (printContent) {
            const WinPrint = window.open('', '', 'width=320,height=650');
            WinPrint?.document.write('<html><head><title>Ticket de Venta</title>');
            // Styles optimized for 80mm thermal printer
            WinPrint?.document.write(`
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        font-size: 10pt; 
                        color: #000;
                        width: 288px; /* Approx 80mm */
                        padding: 10px;
                    }
                    .receipt-container { width: 100%; }
                    h2 { font-size: 14pt; text-align: center; margin: 10px 0; }
                    p { margin: 2px 0; font-size: 9pt;}
                    hr { border: 0; border-top: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                    th, td { padding: 2px 0; }
                    .text-left { text-align: left; }
                    .text-right { text-align: right; }
                    .total-section { margin-top: 10px; }
                    .total { font-weight: bold; font-size: 11pt; }
                    .footer-note { text-align: center; font-size: 8pt; margin-top: 10px; }
                </style>
            `);
            WinPrint?.document.write('</head><body>');
            // We use the content from the ref, which will be styled by the above CSS in the print window
            WinPrint?.document.write(printContent.innerHTML);
            WinPrint?.document.write('</body></html>');
            WinPrint?.document.close();
            WinPrint?.focus();
            WinPrint?.print();
            WinPrint?.close();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-theme-card rounded-lg shadow-xl p-6 w-full max-w-xs">
                {/* This ref content is for both display and printing */}
                <div ref={ticketRef} className="text-black receipt-container">
                    <div className="font-mono">
                        <h2 className="text-xl font-bold text-center mb-2">Flujo POS</h2>
                        <p className="text-center text-xs">Gracias por su compra</p>
                        <hr className="my-2 border-dashed border-gray-400" />
                        <p className="text-xs"><strong>Ticket:</strong> {ticket.id}</p>
                        <p className="text-xs"><strong>Fecha:</strong> {format(ticket.createdAt, "dd/MM/yy HH:mm", { locale: es })}</p>
                        <p className="text-xs"><strong>Vendedor:</strong> {ticket.userName}</p>
                        <hr className="my-2 border-dashed border-gray-400" />
                        <table className="w-full my-2 text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left">Cant</th>
                                    <th className="text-left">Prod</th>
                                    <th className="text-left">Hora</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticket.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-left">{item.quantity}</td>
                                        <td className="text-left">P-{item.productId.slice(-5)}</td>
                                        <td className="text-left">{item.sellTime}:00</td>
                                        <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <hr className="my-2 border-dashed border-gray-400" />
                        <div className="text-right font-bold text-base total-section">
                            <p className="total">TOTAL: ${ticket.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">Cerrar</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-accent">Imprimir</button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;