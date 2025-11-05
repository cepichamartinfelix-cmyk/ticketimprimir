
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SalesPage from './pages/SalesPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/layout/Header';
import { Ticket } from './types';
import { generateTicket, cancelTicket as cancelTicketApi } from './services/api';
import PremioPage from './pages/PremioPage';

type Page = 'sales' | 'dashboard' | 'premio';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Main />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('sales');
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.className = theme.isDark ? 'dark' : '';
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  if (!user) {
    return (
      <div className="bg-theme-background text-theme-foreground min-h-screen">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="bg-theme-background text-theme-foreground min-h-screen flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {currentPage === 'sales' && <SalesPage user={user} />}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'premio' && user.role === 'ADMIN' && <PremioPage />}
      </main>
    </div>
  );
};

export default App;
