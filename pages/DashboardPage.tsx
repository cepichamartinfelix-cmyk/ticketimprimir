
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, User } from '../types';
import { getTickets, getUsers, cancelTicket as apiCancelTicket } from '../services/api';
// FIX: Import 'startOfDay', 'startOfWeek', and 'startOfMonth' from 'date-fns' to fix undefined function errors.
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import KpiCard from '../components/dashboard/KpiCard';
import SalesTable from '../components/dashboard/SalesTable';
import SellerSalesHistory from '../components/dashboard/SellerSalesHistory';

const DashboardPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUser, setFilteredUser] = useState<string>('all');
    const [filteredHour, setFilteredHour] = useState<string>('all');

    useEffect(() => {
        const loadData = async () => {
            const [fetchedTickets, fetchedUsers] = await Promise.all([getTickets(), getUsers()]);
            setTickets(fetchedTickets.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
            setUsers(fetchedUsers);
        };
        loadData();
    }, []);

    const handleCancelTicket = async (ticketId: string) => {
        if(window.confirm('¿Estás seguro de que quieres anular este ticket? Esta acción no se puede deshacer.')) {
            try {
                const cancelledTicket = await apiCancelTicket(ticketId);
                setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? cancelledTicket : t));
            } catch (error) {
                console.error("Failed to cancel ticket:", error);
                alert("No se pudo anular el ticket.");
            }
        }
    };

    const filteredTickets = useMemo(() => {
        let tempTickets = tickets;
        if (filteredUser !== 'all') {
            tempTickets = tempTickets.filter(t => t.userId === filteredUser);
        }
        if (filteredHour !== 'all') {
            const hour = parseInt(filteredHour, 10);
            tempTickets = tempTickets.filter(ticket => 
                ticket.items.some(item => item.sellTime === hour)
            );
        }
        return tempTickets;
    }, [tickets, filteredUser, filteredHour]);
    
    const selectedSeller = useMemo(() => {
        if (filteredUser === 'all') return null;
        return users.find(u => u.id === filteredUser);
    }, [filteredUser, users]);

    const sellerSpecificTickets = useMemo(() => {
        if (!selectedSeller) return [];
        return tickets.filter(t => t.userId === selectedSeller.id && t.status === 'COMPLETED');
    }, [tickets, selectedSeller]);


    const calculateMetrics = (period: 'day' | 'week' | 'month') => {
        const now = new Date();
        let startDate: Date;
        
        if (period === 'day') startDate = startOfDay(now);
        else if (period === 'week') startDate = startOfWeek(now);
        else startDate = startOfMonth(now);

        const periodTickets = filteredTickets.filter(t => t.createdAt >= startDate && t.status === 'COMPLETED');
        
        const netEarnings = periodTickets.reduce((acc, t) => acc + t.total, 0);
        const totalSales = periodTickets.length;

        return { netEarnings, totalSales };
    };
    
    const handleExportCSV = () => {
        if (filteredTickets.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = ['Ticket ID', 'Vendedor', 'Fecha', 'Hora', 'Estado', 'Total'];
        
        const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

        const csvRows = filteredTickets.map(ticket => [
            ticket.id,
            escapeCSV(ticket.userName),
            format(ticket.createdAt, 'yyyy-MM-dd'),
            format(ticket.createdAt, 'HH:mm:ss'),
            ticket.status,
            ticket.total.toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_ventas_${dateStr}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const dailyMetrics = calculateMetrics('day');
    const weeklyMetrics = calculateMetrics('week');
    const monthlyMetrics = calculateMetrics('month');

    const availableHours = Array.from({ length: 17 }, (_, i) => 7 + i); // 7 AM to 11 PM

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="user-filter" className="font-medium whitespace-nowrap">Filtrar por Vendedor:</label>
                    <select 
                        id="user-filter" 
                        value={filteredUser} 
                        onChange={e => setFilteredUser(e.target.value)}
                        className="bg-theme-input border border-theme-border rounded-md px-3 py-2 focus:ring-theme-ring focus:outline-none"
                    >
                        <option value="all">Todos los Vendedores</option>
                        {users.filter(u => u.role === 'SELLER').map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="hour-filter" className="font-medium whitespace-nowrap">Filtrar por Hora:</label>
                    <select 
                        id="hour-filter" 
                        value={filteredHour} 
                        onChange={e => setFilteredHour(e.target.value)}
                        className="bg-theme-input border border-theme-border rounded-md px-3 py-2 focus:ring-theme-ring focus:outline-none"
                    >
                        <option value="all">Todas las Horas</option>
                        {availableHours.map(hour => (
                            <option key={hour} value={hour}>{hour}:00</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Ganancias Netas (Hoy)" value={`$${dailyMetrics.netEarnings.toFixed(2)}`} />
                <KpiCard title="Ganancias Netas (Semana)" value={`$${weeklyMetrics.netEarnings.toFixed(2)}`} />
                <KpiCard title="Ganancias Netas (Mes)" value={`$${monthlyMetrics.netEarnings.toFixed(2)}`} />
                <KpiCard title="Ventas Realizadas (Hoy)" value={`${dailyMetrics.totalSales}`} />
                <KpiCard title="Ventas Realizadas (Semana)" value={`${weeklyMetrics.totalSales}`} />
                <KpiCard title="Ventas Realizadas (Mes)" value={`${monthlyMetrics.totalSales}`} />
            </div>

            {selectedSeller && (
                <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
                    <h2 className="text-xl font-semibold mb-4 text-theme-card-foreground">
                        Historial de Ventas para: {selectedSeller.name}
                    </h2>
                    <SellerSalesHistory tickets={sellerSpecificTickets} />
                </div>
            )}

            <div className="bg-theme-card p-6 rounded-lg shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-theme-card-foreground">
                      {filteredUser !== 'all' ? 'Vista de Ventas Filtradas' : 'Ventas Recientes'}
                    </h2>
                    <button
                      onClick={handleExportCSV}
                      disabled={filteredTickets.length === 0}
                      className="px-4 py-2 bg-theme-primary text-white text-sm font-bold rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring disabled:opacity-50 transition-colors"
                    >
                      Exportar a CSV
                    </button>
                </div>
                <SalesTable tickets={filteredTickets} onCancelTicket={handleCancelTicket} />
            </div>
        </div>
    );
};

export default DashboardPage;