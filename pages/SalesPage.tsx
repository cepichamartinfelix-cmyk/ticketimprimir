
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, User } from '../types';
// FIX: Removed unused import 'updateProductPromotion' which is not exported from '../services/api'.
import { getCategories, getProducts } from '../services/api';
import { getPromotionalProductHighlight } from '../services/geminiService';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import CategoryTabs from '../components/sales/CategoryTabs';

interface SalesPageProps {
  user: User;
}

const SalesPage: React.FC<SalesPageProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const fetchedCategories = await getCategories();
      let fetchedProducts = await getProducts();
      
      setCategories(fetchedCategories);
      
      if (fetchedCategories.length > 0) {
        setActiveCategoryId(fetchedCategories[0].id);
      }
      
      // Process promotions
      const promotionPromises = fetchedCategories.map(cat => {
        const catProducts = fetchedProducts.filter(p => p.categoryId === cat.id);
        return getPromotionalProductHighlight(cat.name, catProducts);
      });

      const promotions = await Promise.all(promotionPromises);
      
      promotions.forEach(promo => {
        if (promo) {
          fetchedProducts = fetchedProducts.map(p => 
            p.id === promo.productId 
            ? {...p, isPromotional: true, promotionReason: promo.reason}
            : p
          );
        }
      });
      
      setProducts(fetchedProducts);
      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter(p => p.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col h-full">
        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
        />
        <div className="flex-grow overflow-y-auto mt-4 pr-2">
           {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <p className="text-xl">Cargando productos y promociones...</p>
             </div>
           ) : (
            <ProductGrid products={filteredProducts} />
           )}
        </div>
      </div>
      <div className="lg:col-span-1 xl:col-span-1 h-full">
        <Cart user={user} />
      </div>
    </div>
  );
};

export default SalesPage;
