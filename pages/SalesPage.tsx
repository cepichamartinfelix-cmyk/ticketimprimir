import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, User, Promotion } from '../types';
import { getCategories, getProducts, getPromotions } from '../services/api';
import { getPromotionalProductHighlight } from '../services/geminiService';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import CategoryTabs from '../components/sales/CategoryTabs';
import { format } from 'date-fns';

interface SalesPageProps {
  user: User;
}

const SalesPage: React.FC<SalesPageProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [fetchedCategories, initialProducts, fetchedPromotions] = await Promise.all([
          getCategories(),
          getProducts(),
          getPromotions(),
      ]);
      
      setCategories(fetchedCategories);
      setPromotions(fetchedPromotions);
      
      if (fetchedCategories.length > 0) {
        setActiveCategoryId(fetchedCategories[0].id);
      }
      
      let processedProducts = [...initialProducts];
      const promotionPromises = fetchedCategories.map(cat => {
        const catProducts = processedProducts.filter(p => p.categoryId === cat.id);
        return getPromotionalProductHighlight(cat.name, catProducts);
      });

      const aiPromotions = await Promise.all(promotionPromises);
      
      aiPromotions.forEach(promo => {
        if (promo) {
          processedProducts = processedProducts.map(p => 
            p.id === promo.productId 
            ? {...p, isPromotional: true, promotionReason: promo.reason}
            : p
          );
        }
      });
      
      setProducts(processedProducts);
      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productsWithLivePromotions = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const currentHour = new Date().getHours();

    const activeTimedPromos = promotions.filter(p => 
        p.promotionDate === todayStr && p.hour === currentHour
    );
    const activePromoMap = new Map(activeTimedPromos.map(p => [p.productId, p]));

    return products.map(p => {
        const timedPromo = activePromoMap.get(p.id);
        if (timedPromo) {
            return {
                ...p,
                isPromotional: true,
                promotionReason: timedPromo.reason
            };
        }
        return p;
    });
  }, [products, promotions]);

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    
    let categoryProducts = productsWithLivePromotions.filter(p => p.categoryId === activeCategoryId);

    if (searchQuery.trim() !== '') {
        categoryProducts = categoryProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return categoryProducts;
  }, [activeCategoryId, productsWithLivePromotions, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col h-full">
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-theme-foreground/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-input border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-ring"
                aria-label="Buscar producto"
            />
        </div>
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