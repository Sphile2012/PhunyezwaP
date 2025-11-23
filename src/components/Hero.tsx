import { useState } from 'react';
import { Search, Calendar, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SearchParams } from '../types';

interface HeroProps {
  onSearch: (params: SearchParams) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, checkIn, checkOut, guests });
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-16">
      <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="mb-4">Find your next adventure</h1>
          <p className="text-gray-600">
            Discover unique stays and experiences around the world
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <label className="block mb-2 text-gray-700">
                  Where
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search destinations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-14 border-gray-300"
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="relative">
                <label className="block mb-2 text-gray-700">
                  Check in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-10 h-14 border-gray-300"
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="relative">
                <label className="block mb-2 text-gray-700">
                  Check out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-10 h-14 border-gray-300"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="relative">
                <label className="block mb-2 text-gray-700">
                  Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="pl-10 h-14 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full md:w-auto mt-4 h-14 px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
