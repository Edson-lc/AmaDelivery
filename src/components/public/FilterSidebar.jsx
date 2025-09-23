import React from 'react';
import { 
  Clock, Star, Percent, Flame, Sandwich, Pizza, IceCream, Utensils,
  Beef, Fish, Carrot, Coffee, Wine, Shell
} from 'lucide-react';

const sortOptions = [
  { id: 'avaliacao', label: 'Avaliações', icon: Star },
  { id: 'tempo_preparo', label: 'Tempo de Entrega', icon: Clock },
  { id: 'taxa_entrega', label: 'Taxa de entrega', icon: Percent },
];

const popularFilters = [
  { id: 'hamburguer', label: 'Hambúrgueres', icon: Flame },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'sanduiches', label: 'Sanduíches', icon: Sandwich },
];

const allFilters = [
  { id: 'hamburguer', label: 'Hambúrgueres', icon: Flame },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'sanduiches', label: 'Sanduíches', icon: Sandwich },
  { id: 'japonesa', label: 'Japonesa', icon: Fish },
  { id: 'brasileira', label: 'Brasileira', icon: Beef },
  { id: 'italiana', 'label': 'Italiana', icon: Utensils },
  { id: 'saudavel', 'label': 'Saudável', icon: Carrot },
  { id: 'sobremesas', 'label': 'Sobremesas', icon: IceCream },
  { id: 'arabe', 'label': 'Árabe', icon: Shell },
  { id: 'chinesa', 'label': 'Chinesa', icon: Utensils },
  { id: 'mexicana', 'label': 'Mexicana', icon: Flame },
  { id: 'bebidas', 'label': 'Bebidas', icon: Wine },
  { id: 'lanches', 'label': 'Lanches', icon: Coffee },
];

const FilterItem = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200 ${
      isActive ? 'bg-orange-50 text-orange-600 font-semibold' : 'hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

export default function FilterSidebar({ activeFilters, onFilterChange }) {
  return (
    <div className="space-y-6 sticky top-24">
      <div>
        <h3 className="font-bold mb-2 px-3">Ordenar por</h3>
        <div className="space-y-1">
          {sortOptions.map(option => (
            <FilterItem
              key={option.id}
              label={option.label}
              icon={option.icon}
              isActive={activeFilters.sortBy === option.id}
              onClick={() => onFilterChange('sortBy', option.id)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-bold mb-2 px-3">Filtros populares</h3>
        <div className="space-y-1">
          {popularFilters.map(filter => (
            <FilterItem
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              isActive={activeFilters.category === filter.id}
              onClick={() => onFilterChange('category', filter.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2 px-3">Mais filtros</h3>
        <div className="space-y-1">
          <FilterItem
            label="Todas as categorias"
            icon={Utensils}
            isActive={activeFilters.category === 'todas'}
            onClick={() => onFilterChange('category', 'todas')}
          />
          {allFilters.map(filter => (
            <FilterItem
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              isActive={activeFilters.category === filter.id}
              onClick={() => onFilterChange('category', filter.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}