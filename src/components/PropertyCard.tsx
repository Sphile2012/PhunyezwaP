import { Star, Heart } from 'lucide-react';
import { Property } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
}

const imageMap: Record<string, string> = {
  'beach villa': 'https://images.unsplash.com/photo-1543489822-c49534f3271f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2Mzg0NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'mountain cabin': 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmlufGVufDF8fHx8MTc2Mzc5Njc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  'luxury loft': 'https://images.unsplash.com/photo-1507149833265-60c372daea22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsb2Z0fGVufDF8fHx8MTc2Mzg2OTA4MXww&ixlib=rb-4.1.0&q=80&w=1080',
  'tropical bungalow': 'https://images.unsplash.com/photo-1662638852986-fdea10dd4f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJ1bmdhbG93fGVufDF8fHx8MTc2Mzg2OTA4MXww&ixlib=rb-4.1.0&q=80&w=1080',
  'tuscany villa': 'https://images.unsplash.com/photo-1721186034559-4b097ca65b1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXNjYW55JTIwdmlsbGF8ZW58MXx8fHwxNzYzODY5MDgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'desert house': 'https://images.unsplash.com/photo-1516357355532-5a2aea76364b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBob3VzZXxlbnwxfHx8fDE3NjM4NjkwODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'lake cottage': 'https://images.unsplash.com/photo-1693498871905-3b0646657786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIwY290dGFnZXxlbnwxfHx8fDE3NjM4NjkwODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'penthouse': 'https://images.unsplash.com/photo-1565623833408-d77e39b88af6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW50aG91c2V8ZW58MXx8fHwxNzYzODY5MDgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
};

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <ImageWithFallback
          src={imageMap[property.images[0]] || ''}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white hover:scale-110 transition-all"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`}
          />
        </Button>

        {/* Superhost Badge */}
        {property.isSuperhost && (
          <Badge className="absolute top-3 left-3 bg-white text-gray-900 hover:bg-white">
            Superhost
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <span className="text-gray-900">{property.location}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span>{property.rating}</span>
            <span className="text-gray-500">({property.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-gray-600 truncate">{property.title}</p>

        {/* Details */}
        <p className="text-gray-500">
          {property.guests} guests · {property.bedrooms} bedrooms · {property.beds} beds
        </p>

        {/* Price */}
        <div className="pt-1">
          <span className="text-gray-900">${property.price}</span>
          <span className="text-gray-600"> night</span>
        </div>
      </div>
    </div>
  );
}
