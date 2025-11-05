
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  currentPage: 'sales' | 'dashboard' | 'premio';
  setCurrentPage: (page: 'sales' | 'dashboard' | 'premio') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = themes.find(t => t.name === event.target.value);
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };
  
  const NavButton: React.FC<{ page: 'sales' | 'dashboard' | 'premio', label: string }> = ({ page, label }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page
          ? 'bg-theme-primary text-white'
          : 'text-theme-foreground hover:bg-theme-accent/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-theme-card border-b border-theme-border shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-theme-primary">Flujo</h1>
        <nav className="flex items-center gap-2">
            <NavButton page="sales" label="Ventas" />
            <NavButton page="dashboard" label="Dashboard" />
            {user?.role === 'ADMIN' && <NavButton page="premio" label="Premio" />}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <select 
          value={theme.name} 
          onChange={handleThemeChange} 
          className="bg-theme-input border border-theme-border text-theme-foreground text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-theme-ring"
        >
          {themes.map(t => (
            <option key={t.name} value={t.name}>{t.name}</option>
          ))}
        </select>
        <div className="text-sm text-right">
            <div className="font-medium text-theme-foreground">{user?.name}</div>
            <div className="text-xs text-theme-foreground/70">{user?.role}</div>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default Header;
