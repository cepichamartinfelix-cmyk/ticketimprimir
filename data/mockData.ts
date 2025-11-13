import { User, Category, Product, Ticket, Promotion } from '../types';
import { add, sub, format } from 'date-fns';

const generateUsers = (): User[] => [
  { id: 'user-1', name: 'Admin User', email: 'admin@flujo.com', role: 'ADMIN' },
  { id: 'user-2', name: 'Alicia Vega', email: 'alicia@flujo.com', role: 'SELLER' },
  { id: 'user-3', name: 'Bruno Soto', email: 'bruno@flujo.com', role: 'SELLER' },
  { id: 'user-4', name: 'Carla Nuez', email: 'carla@flujo.com', role: 'SELLER' },
  { id: 'user-5', name: 'Admin User5', email: 'admin5@flujo.com', role: 'ADMIN' },
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
      // Simulate low stock for ~10% of products
      const stock = Math.random() < 0.1 
        ? Math.floor(Math.random() * 5) + 1 // 1 to 5
        : Math.floor(Math.random() * 95) + 5; // 5 to 99

      products.push({
        id: `prod-${category.id}-${i}`,
        name: `${category.name.slice(0, -1)} #${i}`,
        categoryId: category.id,
        price: parseFloat((Math.random() * (15 - 2) + 2).toFixed(2)),
        stock: stock,
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

const generateInitialPromotions = (products: Product[]): Promotion[] => {
    const promotions: Promotion[] = [];
    const today = new Date();
    const dates = [
        format(today, 'yyyy-MM-dd'),
        format(sub(today, { days: 1 }), 'yyyy-MM-dd'),
        format(sub(today, { days: 2 }), 'yyyy-MM-dd'),
        format(sub(today, { days: 3 }), 'yyyy-MM-dd'),
    ];

    for (let i = 0; i < 10; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomDate = dates[Math.floor(Math.random() * dates.length)];
        const randomHour = Math.floor(Math.random() * (23 - 7 + 1)) + 7; // 7 to 23
        
        promotions.push({
            id: `promo-${Date.now()}-${i}`,
            productId: randomProduct.id,
            productName: randomProduct.name,
            reason: `¡Oferta especial de ${randomProduct.name.split(' ')[0]}!`,
            promotionDate: randomDate,
            hour: randomHour,
            createdAt: sub(new Date(), { days: 3-dates.indexOf(randomDate), hours: i }),
        });
    }
    return promotions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};


const users = generateUsers();
const categories = generateCategories();
const products = generateProducts(categories);
const tickets = generateInitialTickets(users, products);
const promotions = generateInitialPromotions(products);

export const MOCK_DATA = {
  users,
  categories,
  products,
  tickets,
  promotions
};