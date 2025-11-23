import { Mountain, Waves, Home, Trees, Palmtree, Castle, Tent, Building2 } from 'lucide-react';
import { Button } from './ui/button';

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: Home },
  { id: 'beach', label: 'Beach', icon: Waves },
  { id: 'mountain', label: 'Mountains', icon: Mountain },
  { id: 'tropical', label: 'Tropical', icon: Palmtree },
  { id: 'countryside', label: 'Countryside', icon: Trees },
  { id: 'historic', label: 'Historic', icon: Castle },
  { id: 'camping', label: 'Camping', icon: Tent },
  { id: 'urban', label: 'Urban', icon: Building2 },
];

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-20 z-40">
      <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
        <div className="flex items-center gap-6 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => onCategoryChange(category.id)}
                className={`flex flex-col items-center gap-2 min-w-fit px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-gray-900 border-b-2 border-gray-900 rounded-none' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs whitespace-nowrap">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
