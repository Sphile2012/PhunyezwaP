export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  isSuperhost: boolean;
}

export interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}
