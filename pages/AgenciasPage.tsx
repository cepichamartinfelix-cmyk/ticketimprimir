
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../types';
import { getProducts, getCategories, updateStock } from '../services/api';

const AgenciasPage: React.FC = () => {
    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form state
    const [updateType, setUpdateType] = useState<'all' | 'category' | 'single'>('single');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');

    // UI Feedback state
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Product list filter state
    const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fetchedProducts, fetchedCategories] = await Promise.all([getProducts(), getCategories()]);
            setProducts(fetchedProducts);
            setCategories(fetchedCategories);
            if (fetchedCategories.length > 0) {
                setSelectedCategoryId(fetchedCategories[0].id);
                setFilterCategoryId('all');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cargar los datos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const productsInCategory = useMemo(() => {
        if (!selectedCategoryId) return [];
        return products.filter(p => p.categoryId === selectedCategoryId);
    }, [selectedCategoryId, products]);
    
    // Auto-select first product when category changes for 'single' mode
     useEffect(() => {
        if(updateType === 'single' && productsInCategory.length > 0) {
            setSelectedProductId(productsInCategory[0].id);
        } else {
            setSelectedProductId('');
        }
    }, [selectedCategoryId, productsInCategory, updateType]);

    const filteredProductList = useMemo(() => {
        if (filterCategoryId === 'all') return products;
        return products.filter(p => p.categoryId === filterCategoryId);
    }, [filterCategoryId, products]);

    const handleUpdateTypeChange = (newType: 'all' | 'category' | 'single') => {
        setUpdateType(newType);
        setSelectedCategoryId(categories.length > 0 ? categories[0].id : '');
        setQuantity('');
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const stockQuantity = parseInt(quantity, 10);
        if (quantity === '' || isNaN(stockQuantity) || stockQuantity < 0) {
            setMessage({ type: 'error', text: 'Por favor, introduce una cantidad de stock válida (número entero >= 0).' });
            return;
        }

        if ((updateType === 'category' || updateType === 'single') && !selectedCategoryId) {
            setMessage({ type: 'error', text: 'Por favor, selecciona una categoría.' });
            return;
        }

        if (updateType === 'single' && !selectedProductId) {
            setMessage({ type: 'error', text: 'Por favor, selecciona un producto.' });
            return;
        }

        setIsUpdating(true);
        try {
            await updateStock({
                type: updateType,
                quantity: stockQuantity,
                categoryId: updateType !== 'all' ? selectedCategoryId : undefined,
                productId: updateType === 'single' ? selectedProductId : undefined,
            });

            const updatedProducts = await getProducts();
            setProducts(updatedProducts);
            
            setMessage({ type: 'success', text: `Stock actualizado correctamente.` });
            setQuantity('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar el stock.' });
        } finally {
            setIsUpdating(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10 text-xl">Cargando gestión de stock...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión de Stock de Agencias</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border sticky top-6">
                        <h2 className="text-xl font-semibold mb-4">Actualizar Stock</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-card-foreground/90 mb-2">Tipo de Actualización</label>
                                <div className="flex flex-col space-y-2">
                                    <label className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${updateType === 'single' ? 'bg-theme-primary/10 border border-theme-primary' : 'bg-theme-background hover:bg-theme-border/50'}`}>
                                        <input type="radio" name="updateType" value="single" checked={updateType === 'single'} onChange={() => handleUpdateTypeChange('single')} className="form-radio text-theme-primary focus:ring-theme-ring"/>
                                        <span className="text-sm font-medium text-theme-foreground">Un producto específico</span>
                                    </label>
                                    <label className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${updateType === 'category' ? 'bg-theme-primary/10 border border-theme-primary' : 'bg-theme-background hover:bg-theme-border/50'}`}>
                                        <input type="radio" name="updateType" value="category" checked={updateType === 'category'} onChange={() => handleUpdateTypeChange('category')} className="form-radio text-theme-primary focus:ring-theme-ring"/>
                                        <span className="text-sm font-medium text-theme-foreground">Toda una categoría</span>
                                    </label>
                                    <label className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${updateType === 'all' ? 'bg-theme-primary/10 border border-theme-primary' : 'bg-theme-background hover:bg-theme-border/50'}`}>
                                        <input type="radio" name="updateType" value="all" checked={updateType === 'all'} onChange={() => handleUpdateTypeChange('all')} className="form-radio text-theme-primary focus:ring-theme-ring"/>
                                        <span className="text-sm font-medium text-theme-foreground">Todos los productos</span>
                                    </label>
                                </div>
                            </div>
                            
                            {(updateType === 'category' || updateType === 'single') && (
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Categoría</label>
                                    <select id="category" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring">
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {updateType === 'single' && (
                                <div>
                                    <label htmlFor="product" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Producto</label>
                                    <select id="product" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring" disabled={productsInCategory.length === 0}>
                                        {productsInCategory.length > 0 ? productsInCategory.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>) : <option>No hay productos en esta categoría</option>}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-theme-card-foreground/90 mb-1">Nueva Cantidad de Stock</label>
                                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} min="0" className="w-full px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring" placeholder="Ej: 50" required />
                            </div>

                            <button type="submit" disabled={isUpdating} className="w-full bg-theme-primary text-white font-bold py-2 px-4 rounded-md hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-ring disabled:opacity-50 transition-colors">
                                {isUpdating ? 'Actualizando...' : 'Actualizar Stock'}
                            </button>
                            
                            {message && (
                                <p className={`text-sm text-center p-2 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role={message.type === 'error' ? 'alert' : 'status'}>
                                    {message.text}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold">Inventario Actual</h2>
                        <div className="flex items-center gap-2">
                           <label htmlFor="filter-category" className="text-sm font-medium whitespace-nowrap">Filtrar por Categoría:</label>
                           <select id="filter-category" value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)} className="w-full sm:w-auto px-3 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring text-sm">
                                <option value="all">Todas las categorías</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="overflow-y-auto max-h-[65vh] border border-theme-border rounded-md">
                         <table className="min-w-full divide-y divide-theme-border">
                             <thead className="bg-theme-background sticky top-0">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase">Producto</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-theme-card-foreground/70 uppercase">Categoría</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-theme-card-foreground/70 uppercase">Stock Actual</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-theme-card divide-y divide-theme-border">
                                {filteredProductList.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-card-foreground">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-card-foreground/80">{categories.find(c => c.id === product.categoryId)?.name || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${product.stock !== undefined && product.stock <= 5 ? 'text-red-500' : 'text-theme-card-foreground'}`}>
                                            {product.stock ?? 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AgenciasPage;
