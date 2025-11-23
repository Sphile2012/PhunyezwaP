import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { PropertyGrid } from './components/PropertyGrid';
import { Property } from './types';

// Mock data for properties
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Beachfront Villa',
    location: 'Malibu, California',
    price: 450,
    rating: 4.95,
    reviewCount: 127,
    images: ['beach villa'],
    guests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 3,
    amenities: ['Wifi', 'Kitchen', 'Beach access', 'Pool'],
    isSuperhost: true,
  },
  {
    id: '2',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 320,
    rating: 4.89,
    reviewCount: 89,
    images: ['mountain cabin'],
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Fireplace', 'Mountain view'],
    isSuperhost: true,
  },
  {
    id: '3',
    title: 'Downtown Luxury Loft',
    location: 'New York, New York',
    price: 275,
    rating: 4.92,
    reviewCount: 156,
    images: ['luxury loft'],
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Gym', 'City view'],
    isSuperhost: false,
  },
  {
    id: '4',
    title: 'Tropical Paradise Bungalow',
    location: 'Maui, Hawaii',
    price: 380,
    rating: 4.97,
    reviewCount: 203,
    images: ['tropical bungalow'],
    guests: 5,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Beach access', 'Outdoor shower'],
    isSuperhost: true,
  },
  {
    id: '5',
    title: 'Historic Countryside Estate',
    location: 'Tuscany, Italy',
    price: 520,
    rating: 4.94,
    reviewCount: 142,
    images: ['tuscany villa'],
    guests: 10,
    bedrooms: 5,
    beds: 7,
    baths: 4,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Wine cellar'],
    isSuperhost: true,
  },
  {
    id: '6',
    title: 'Minimalist Desert Retreat',
    location: 'Joshua Tree, California',
    price: 295,
    rating: 4.88,
    reviewCount: 94,
    images: ['desert house'],
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Hot tub', 'Stargazing deck'],
    isSuperhost: false,
  },
  {
    id: '7',
    title: 'Lakeside Family Cottage',
    location: 'Lake Tahoe, Nevada',
    price: 340,
    rating: 4.91,
    reviewCount: 118,
    images: ['lake cottage'],
    guests: 7,
    bedrooms: 3,
    beds: 5,
    baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Lake access', 'Kayaks'],
    isSuperhost: true,
  },
  {
    id: '8',
    title: 'Urban Penthouse Suite',
    location: 'Miami, Florida',
    price: 425,
    rating: 4.93,
    reviewCount: 167,
    images: ['penthouse'],
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    amenities: ['Wifi', 'Kitchen', 'Ocean view', 'Rooftop terrace'],
    isSuperhost: true,
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    // Filter properties based on search params
    let filtered = mockProperties;
    
    if (params.location) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(params.location.toLowerCase())
      );
    }
    
    if (params.guests) {
      filtered = filtered.filter(p => p.guests >= params.guests);
    }
    
    setFilteredProperties(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // In a real app, this would filter by property type
    setFilteredProperties(mockProperties);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero onSearch={handleSearch} />
      <CategoryNav 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <PropertyGrid properties={filteredProperties} />
    </div>
  );
}
