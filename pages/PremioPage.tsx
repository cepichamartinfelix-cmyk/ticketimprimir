
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product } from '../types';
import { getCategories, getProducts } from '../services/api';
import CategoryTabs from '../components/sales/CategoryTabs';
import PremioProductCard from '../components/premio/PremioProductCard';

const PremioPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [fetchedCategories, fetchedProducts] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);
    
    setCategories(fetchedCategories);
    setProducts(fetchedProducts);
    
    if (fetchedCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(fetchedCategories[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter(p => p.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold mb-4">Gestionar Productos Premio</h1>
      <p className="text-theme-foreground/80 mb-6">Aquí puedes seleccionar qué productos se mostrarán como promocionales en la página de ventas y añadirles un texto de promoción (tooltip).</p>
      
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />
      <div className="flex-grow overflow-y-auto mt-4 pr-2">
         {isLoading ? (
           <div className="flex justify-center items-center h-full">
              <p className="text-xl">Cargando productos...</p>
           </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredProducts.map(product => (
                    <PremioProductCard 
                        key={product.id} 
                        product={product}
                        onUpdate={handleProductUpdate}
                    />
                ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default PremioPage;
