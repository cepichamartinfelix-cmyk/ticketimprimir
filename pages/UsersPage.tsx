
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [isEditing, setIsEditing] = useState<string | null>(null); // holds user ID being edited
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'SELLER'>('SELLER');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (err) {
            setError('No se pudieron cargar los usuarios.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearForm = () => {
        setIsEditing(null);
        setName('');
        setEmail('');
        setRole('SELLER');
        setError('');
        setSuccess('');
    };

    const handleEditClick = (user: User) => {
        setIsEditing(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await deleteUser(userId);
                setSuccess('Usuario eliminado correctamente.');
                setTimeout(() => setSuccess(''), 2000);
                loadUsers(); // Refresh list
            } catch (err: any) {
                setError(err.message || 'Error al eliminar el usuario.');
                setTimeout(() => setError(''), 3000);
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !email) {
            setError('Nombre y email son requeridos.');
            return;
        }

        try {
            if (isEditing) {
                await updateUser(isEditing, { name, email, role });
                setSuccess('Usuario actualizado correctamente.');
            } else {
                await createUser({ name, email, role });
                setSuccess('Usuario creado correctamente.');
            }
            setTimeout(() => setSuccess(''), 2000);
            clearForm();
            loadUsers(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error.');
            setTimeout(() => setError(''), 3000);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            
            <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Nombre</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring" required />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Rol</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as 'ADMIN' | 'SELLER')} className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring">
                            <option value="SELLER">Vendedor</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-end gap-3 mt-2">
                        {isEditing && (
                            <button type="button" onClick={clearForm} className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                                Cancelar Edición
                            </button>
                        )}
                        <button type="submit" className="px-4 py-2 bg-theme-primary text-white font-bold rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring transition-colors">
                            {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-500 text-sm mt-4" role="alert">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-4" role="status">{success}</p>}
            </div>

            <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
                <h2 className="text-xl font-semibold mb-4">Lista de Usuarios</h2>
                {isLoading ? (
                    <p>Cargando usuarios...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-theme-border">
                            <thead className="bg-theme-card">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-theme-card-foreground/70 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-theme-card divide-y divide-theme-border">
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-card-foreground">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/90">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                                            <button onClick={() => handleEditClick(user)} className="text-theme-primary hover:text-theme-accent">Editar</button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
