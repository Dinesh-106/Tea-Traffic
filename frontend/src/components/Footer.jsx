import React from 'react';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 py-6 mt-auto w-full z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="font-bold text-white text-base mb-1">Tea Traffic Shop</p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={14} className="text-brand-orange-500 flex-shrink-0" />
            <span>123 Main Food Street, City Center</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Phone size={14} className="text-brand-orange-500 flex-shrink-0" />
            <span>+91 98765 43210</span>
          </div>
        </div>

        <div className="text-center md:text-right mt-4 md:mt-0 font-medium">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Developed By</p>
          <p className="text-brand-orange-500 text-base font-semibold">ER.G.Dinesh</p>
        </div>
        
      </div>
    </footer>
  );
}
