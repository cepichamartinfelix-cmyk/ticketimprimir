
import { User, Category, Product, Ticket } from '../types';
import { add, sub } from 'date-fns';

const generateUsers = (): User[] => [
  { id: 'user-1', name: 'Admin User', email: 'admin@flujo.com', role: 'ADMIN' },
  { id: 'user-2', name: 'Alicia Vega', email: 'alicia@flujo.com', role: 'SELLER' },
  { id: 'user-3', name: 'Bruno Soto', email: 'bruno@flujo.com', role: 'SELLER' },
  { id: 'user-4', name: 'Carla Nuez', email: 'carla@flujo.com', role: 'SELLER' },
];

const generateCategories = (): Category[] => {
  const categoryNames = [
    'Bebidas Calientes', 'Bebidas Frías', 'Panadería', 'Pastelería',
    'Sándwiches', 'Ensaladas', 'Snacks', 'Postres'
  ];
  return categoryNames.map((name, index) => ({
    id: `cat-${index + 1}`,
    name,
  }));
};

const generateProducts = (categories: Category[]): Product[] => {
  const products: Product[] = [];
  categories.forEach(category => {
    for (let i = 1; i <= 36; i++) {
      products.push({
        id: `prod-${category.id}-${i}`,
        name: `${category.name.slice(0, -1)} #${i}`,
        categoryId: category.id,
        price: parseFloat((Math.random() * (15 - 2) + 2).toFixed(2)),
      });
    }
  });
  return products;
};

const generateInitialTickets = (users: User[], products: Product[]): Ticket[] => {
  const tickets: Ticket[] = [];
  const sellers = users.filter(u => u.role === 'SELLER');
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
    const randomDay = sub(today, { days: Math.floor(Math.random() * 30) });
    const ticketHour = Math.floor(Math.random() * (23 - 7)) + 7;
    randomDay.setHours(ticketHour, Math.floor(Math.random() * 60));

    const numItems = Math.floor(Math.random() * 5) + 1;
    const ticketItems = [];
    for (let j = 0; j < numItems; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      ticketItems.push({
        productId: randomProduct.id,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: randomProduct.price,
        sellTime: ticketHour + Math.floor(Math.random() * 2) // a bit of variation
      });
    }

    const total = ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isCancelled = Math.random() < 0.1;

    tickets.push({
      id: `TICKET-MOCK-${i}`,
      userId: randomSeller.id,
      userName: randomSeller.name,
      createdAt: randomDay,
      items: ticketItems,
      total: total,
      status: isCancelled ? 'CANCELLED' : 'COMPLETED',
    });
  }
  return tickets;
};


const users = generateUsers();
const categories = generateCategories();
const products = generateProducts(categories);
const tickets = generateInitialTickets(users, products);

export const MOCK_DATA = {
  users,
  categories,
  products,
  tickets
};
