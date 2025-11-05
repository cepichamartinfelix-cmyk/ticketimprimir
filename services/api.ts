
import { MOCK_DATA } from '../data/mockData';
import { Product, Ticket, TicketItem, User, CartItem } from '../types';

let users = [...MOCK_DATA.users];
let products = [...MOCK_DATA.products];
let categories = [...MOCK_DATA.categories];
let tickets = [...MOCK_DATA.tickets];

// --- User ---
export const login = async (email: string): Promise<User | null> => {
  console.log(`Attempting login for email: ${email}`);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    console.log(`User found: ${user.name}`);
    return Promise.resolve(user);
  }
  console.log("User not found");
  return Promise.resolve(null);
};

export const getUsers = async (): Promise<User[]> => Promise.resolve(users);

// --- Catalog ---
export const getCategories = async () => Promise.resolve(categories);

export const getProducts = async () => Promise.resolve(products);

export const updateProductPromotion = (productId: string, reason: string) => {
    products = products.map(p => 
        p.id === productId 
        ? {...p, isPromotional: true, promotionReason: reason}
        : p
    );
};

// --- Tickets ---
export const getTickets = async (): Promise<Ticket[]> => {
    const ticketsWithUserData = tickets.map(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        return {
            ...ticket,
            userName: user?.name || 'Unknown User'
        }
    });
    return Promise.resolve(ticketsWithUserData);
}


export const generateTicket = async (userId: string, items: CartItem[]): Promise<Ticket> => {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  const newTicket: Ticket = {
    id: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName: user.name,
    createdAt: new Date(),
    items: items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      sellTime: item.sellTime,
    })),
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    status: 'COMPLETED',
  };
  tickets.push(newTicket);
  return Promise.resolve(newTicket);
};

export const cancelTicket = async (ticketId: string): Promise<Ticket> => {
    let updatedTicket: Ticket | undefined;
    tickets = tickets.map(ticket => {
        if (ticket.id === ticketId) {
            updatedTicket = { ...ticket, status: 'CANCELLED' };
            return updatedTicket;
        }
        return ticket;
    });

    if (!updatedTicket) {
        throw new Error('Ticket not found');
    }
    return Promise.resolve(updatedTicket);
}
