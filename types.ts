
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER';
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  isPromotional?: boolean;
  promotionReason?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  sellTime: number;
}

export interface TicketItem {
  productId: string;
  quantity: number;
  price: number;
  sellTime: number;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  createdAt: Date;
  items: TicketItem[];
  total: number;
  status: 'COMPLETED' | 'CANCELLED';
}

export type Theme = {
  name: string;
  isDark: boolean;
  colors: {
    '--color-primary': string;
    '--color-secondary': string;
    '--color-accent': string;
    '--color-background': string;
    '--color-foreground': string;
    '--color-card': string;
    '--color-card-foreground': string;
    '--color-border': string;
    '--color-input': string;
    '--color-ring': string;
  };
};
