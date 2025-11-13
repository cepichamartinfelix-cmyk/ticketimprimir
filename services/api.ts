
import { MOCK_DATA } from '../data/mockData';
import { Product, Ticket, TicketItem, User, CartItem, Promotion } from '../types';
import { format } from 'date-fns';

let users = [...MOCK_DATA.users];
let products = [...MOCK_DATA.products];
let categories = [...MOCK_DATA.categories];
let tickets = [...MOCK_DATA.tickets];
let promotions = [...MOCK_DATA.promotions];

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

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
        throw new Error('El email ya está en uso.');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
    };
    users.push(newUser);
    return Promise.resolve(newUser);
};

export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id'>>): Promise<User> => {
    let updatedUser: User | undefined;
    users = users.map(user => {
        if (user.id === userId) {
            updatedUser = { ...user, ...updates };
            return updatedUser;
        }
        return user;
    });

    if (!updatedUser) {
        throw new Error('Usuario no encontrado.');
    }
    return Promise.resolve(updatedUser);
};

export const deleteUser = async (userId: string): Promise<{ success: true }> => {
    const initialLength = users.length;
    users = users.filter(user => user.id !== userId);
    if (users.length === initialLength) {
        throw new Error('Usuario no encontrado.');
    }
    return Promise.resolve({ success: true });
};


// --- Catalog ---
export const getCategories = async () => Promise.resolve(categories);

export const getProducts = async () => Promise.resolve(products);

// --- Stock Management ---
export const updateStock = async (payload: {
    type: 'all' | 'category' | 'single';
    quantity: number;
    categoryId?: string;
    productId?: string;
}): Promise<{ success: true, updatedCount: number }> => {
    const { type, quantity, categoryId, productId } = payload;

    if (quantity < 0 || !Number.isInteger(quantity)) {
        throw new Error('La cantidad de stock debe ser un número entero no negativo.');
    }

    let updatedCount = 0;

    if (type === 'all') {
        products = products.map(p => ({ ...p, stock: quantity }));
        updatedCount = products.length;
    } else if (type === 'category' && categoryId) {
        let categoryExists = false;
        products = products.map(p => {
            if (p.categoryId === categoryId) {
                categoryExists = true;
                updatedCount++;
                return { ...p, stock: quantity };
            }
            return p;
        });
        if (!categoryExists) throw new Error('Categoría no encontrada.');
    } else if (type === 'single' && productId) {
        let productExists = false;
        products = products.map(p => {
            if (p.id === productId) {
                productExists = true;
                updatedCount++;
                return { ...p, stock: quantity };
            }
            return p;
        });
        if (!productExists) throw new Error('Producto no encontrado.');

    } else {
        throw new Error('Parámetros de actualización inválidos.');
    }

    if (updatedCount === 0 && type !== 'all') {
        throw new Error('No se encontraron productos para actualizar con los criterios dados.');
    }

    return Promise.resolve({ success: true, updatedCount });
};


// --- Promotions ---
export const getPromotions = async (): Promise<Promotion[]> => Promise.resolve(promotions);

export const createPromotion = async (data: { productId: string, productName: string, reason: string, hour: number }): Promise<Promotion> => {
    const newPromotion: Promotion = {
        id: `promo-${Date.now()}`,
        ...data,
        promotionDate: format(new Date(), 'yyyy-MM-dd'),
        createdAt: new Date(),
    };
    promotions.unshift(newPromotion);
    return Promise.resolve(newPromotion);
};

export const deletePromotion = async (promotionId: string): Promise<{ success: true }> => {
    const initialLength = promotions.length;
    promotions = promotions.filter(p => p.id !== promotionId);
    if (promotions.length === initialLength) {
        throw new Error('Promoción no encontrada.');
    }
    return Promise.resolve({ success: true });
};

export const updatePromotion = async (promotionId: string, updates: Partial<{ reason: string; hour: number }>): Promise<Promotion> => {
    let updatedPromotion: Promotion | undefined;
    promotions = promotions.map(promo => {
        if (promo.id === promotionId) {
            updatedPromotion = { ...promo, ...updates };
            return updatedPromotion;
        }
        return promo;
    });

    if (!updatedPromotion) {
        throw new Error('Promoción no encontrada.');
    }
    
    // Maintain sort order
    promotions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return Promise.resolve(updatedPromotion);
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
