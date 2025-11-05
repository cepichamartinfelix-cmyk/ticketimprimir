
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, User } from '../types';
import { getTickets, getUsers, cancelTicket as apiCancelTicket } from '../services/api';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import KpiCard from '../components/dashboard/KpiCard';
import SalesTable from '../components/dashboard/SalesTable';

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

            <div className="bg-theme-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-theme-card-foreground">Ventas Recientes</h2>
                <SalesTable tickets={filteredTickets} onCancelTicket={handleCancelTicket} />
            </div>
        </div>
    );
};

export default DashboardPage;
