import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, Promotion } from '../types';
import { getCategories, getProducts, getPromotions, createPromotion, deletePromotion, updatePromotion } from '../services/api';
import CategoryTabs from '../components/sales/CategoryTabs';
import PremioProductCard from '../components/premio/PremioProductCard';
import EditPromotionForm from '../components/premio/EditPromotionForm';
import { format, parseISO, startOfToday, subDays, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface PromotionsListProps {
    promotions: Promotion[];
    onDelete: (id: string) => void;
    editingPromotionId: string | null;
    onEditStart: (id: string) => void;
    onEditCancel: () => void;
    onUpdate: (id: string, data: { reason: string; hour: number }) => Promise<void>;
}

const PromotionsList: React.FC<PromotionsListProps> = ({ 
    promotions, 
    onDelete,
    editingPromotionId,
    onEditStart,
    onEditCancel,
    onUpdate
}) => {
    const groupedPromotions = useMemo(() => {
        const groups: { [key: string]: Promotion[] } = {};
        promotions.forEach(p => {
            if (!groups[p.promotionDate]) {
                groups[p.promotionDate] = [];
            }
            groups[p.promotionDate].push(p);
        });
        return Object.entries(groups).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
    }, [promotions]);

    const today = startOfToday();
    const visibleDates = [
        today,
        subDays(today, 1),
        subDays(today, 2),
        subDays(today, 3)
    ];

    const getDayLabel = (date: Date) => {
        if (isSameDay(date, today)) return 'Hoy';
        if (isSameDay(date, subDays(today, 1))) return 'Ayer';
        return format(date, 'EEEE, dd MMMM', { locale: es });
    };
    
    const relevantGroups = groupedPromotions.filter(([dateStr]) => {
        const promoDate = parseISO(dateStr + 'T12:00:00Z');
        return visibleDates.some(visibleDate => isSameDay(promoDate, visibleDate));
    });

    if (promotions.length === 0) {
        return (
            <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border text-center">
                <h2 className="text-xl font-semibold mb-2">Promociones Activas y Recientes</h2>
                <p className="text-theme-card-foreground/70">Aún no se han creado promociones.</p>
            </div>
        )
    }

    return (
        <div className="bg-theme-card p-6 rounded-lg shadow-sm border border-theme-border">
            <h2 className="text-xl font-semibold mb-4">Promociones Activas y Recientes</h2>
            <div className="space-y-6">
                {relevantGroups.map(([dateStr, promos]) => {
                    const date = parseISO(dateStr + 'T12:00:00Z');
                    return (
                        <div key={dateStr}>
                            <h3 className="font-bold text-lg capitalize mb-2 border-b border-theme-border pb-1">
                                {getDayLabel(date)}
                            </h3>
                            <ul className="space-y-2">
                                {promos.sort((a,b) => b.hour - a.hour).map(p => (
                                    <li key={p.id} className="flex items-center justify-between bg-theme-background rounded-md min-h-[76px]">
                                        {editingPromotionId === p.id ? (
                                            <EditPromotionForm 
                                                promotion={p}
                                                onSave={onUpdate}
                                                onCancel={onEditCancel}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-between w-full p-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-theme-foreground">{p.productName}</p>
                                                    <p className="text-sm text-theme-foreground/80">{p.reason}</p>
                                                </div>
                                                <div className="text-center px-4">
                                                    <p className="font-bold text-lg text-theme-primary">{p.hour}:00</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => onEditStart(p.id)}
                                                        className="px-3 py-1.5 bg-theme-secondary text-white text-xs font-medium rounded-md hover:bg-theme-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label={`Editar promoción de ${p.productName}`}
                                                        disabled={!isToday(parseISO(p.promotionDate + 'T00:00:00'))}
                                                        title={!isToday(parseISO(p.promotionDate + 'T00:00:00')) ? "Solo se pueden editar promociones de hoy." : "Editar Promoción"}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => onDelete(p.id)}
                                                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
                                                        aria-label={`Eliminar promoción de ${p.productName}`}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PremioPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [fetchedCategories, fetchedProducts, fetchedPromotions] = await Promise.all([
      getCategories(),
      getProducts(),
      getPromotions(),
    ]);
    
    setCategories(fetchedCategories);
    setProducts(fetchedProducts);
    setPromotions(fetchedPromotions);
    
    if (fetchedCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(fetchedCategories[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePromotion = async (data: { productId: string, productName: string, reason: string, hour: number }) => {
      const newPromotion = await createPromotion(data);
      setPromotions(prev => [newPromotion, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const handleDeletePromotion = async (promotionId: string) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
          await deletePromotion(promotionId);
          setPromotions(prev => prev.filter(p => p.id !== promotionId));
      }
  };

  const handleUpdatePromotion = async (promotionId: string, data: { reason: string; hour: number }) => {
    try {
        const updatedPromotion = await updatePromotion(promotionId, data);
        setPromotions(prev => 
            prev.map(p => (p.id === promotionId ? updatedPromotion : p))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        );
        setEditingPromotionId(null);
    } catch (error) {
        console.error("Failed to update promotion:", error);
        alert("No se pudo actualizar la promoción.");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter(p => p.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  const recentPromotions = useMemo(() => {
      const today = startOfToday();
      const fourDaysAgo = subDays(today, 4);
      return promotions.filter(p => {
          const promoDate = parseISO(p.promotionDate + 'T12:00:00Z');
          return promoDate >= fourDaysAgo;
      });
  }, [promotions]);

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Gestionar Promociones por Hora</h1>
          <p className="text-theme-foreground/80">Crea o edita promociones para productos específicos en horas determinadas del día de hoy. Las promociones se mostrarán resaltadas en la pantalla de Ventas durante la hora activa.</p>
        </div>

        <PromotionsList 
            promotions={recentPromotions} 
            onDelete={handleDeletePromotion}
            editingPromotionId={editingPromotionId}
            onEditStart={setEditingPromotionId}
            onEditCancel={() => setEditingPromotionId(null)}
            onUpdate={handleUpdatePromotion}
        />

        <div>
            <h2 className="text-2xl font-bold mb-4">Crear Nueva Promoción (para Hoy)</h2>
            <CategoryTabs
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
            />
            <div className="flex-grow overflow-y-auto mt-4 pr-2">
                {isLoading ? (
                <div className="flex justify-center items-center h-full py-10">
                    <p className="text-xl">Cargando productos...</p>
                </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {filteredProducts.map(product => (
                            <PremioProductCard 
                                key={product.id} 
                                product={product}
                                onCreate={handleCreatePromotion}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PremioPage;