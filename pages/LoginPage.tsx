
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email);
      if (!user) {
        setError('Email no encontrado. Intenta con: admin@flujo.com, alicia@flujo.com, bruno@flujo.com, o carla@flujo.com');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-theme-card shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-theme-card-foreground mb-2">Flujo</h1>
          <p className="text-center text-theme-card-foreground/80 mb-8">Sistema Integral de Ventas</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-theme-card-foreground/90 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring"
                placeholder="tu@email.com"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-theme-primary text-white font-bold py-2 px-4 rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
