import { Search, Globe, Menu, User } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="hidden sm:block text-rose-500">staycation</span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center gap-4 border border-gray-300 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <button className="hover:bg-gray-100 px-4 py-1 rounded-full transition-colors">
              Anywhere
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button className="hover:bg-gray-100 px-4 py-1 rounded-full transition-colors">
              Any week
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button className="hover:bg-gray-100 px-4 py-1 rounded-full transition-colors text-gray-500">
              Add guests
            </button>
            <div className="bg-rose-500 p-2 rounded-full">
              <Search className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Mobile Search Button */}
          <button className="md:hidden flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 shadow-sm">
            <Search className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm">Anywhere</span>
            </div>
          </button>

          {/* Right Menu */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden lg:block rounded-full">
              Become a Host
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-3 hover:shadow-md transition-shadow cursor-pointer">
              <Menu className="w-4 h-4" />
              <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
