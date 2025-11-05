
import React from 'react';
import { Category } from '../../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategoryId, onSelectCategory }) => {
  return (
    <div className="border-b border-theme-border">
      <nav className="-mb-px flex space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeCategoryId === category.id
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-theme-foreground/60 hover:text-theme-foreground hover:border-theme-border'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CategoryTabs;
