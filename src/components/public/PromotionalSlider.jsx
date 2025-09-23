
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import RestaurantCard from "./RestaurantCard";

export default function PromotionalSlider({ restaurants }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sliderRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isHovered || restaurants.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % restaurants.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isHovered, restaurants.length]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + restaurants.length) % restaurants.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % restaurants.length);
  };

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma promoção disponível no momento.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative overflow-hidden rounded-xl bg-white shadow-lg select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="w-full flex-shrink-0">
              <div className="relative h-80 sm:h-96">
                {/* Background Image */}
                <img
                  src={restaurant.imagem_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop"}
                  alt={restaurant.nome}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop";
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="text-white space-y-4">
                        <div className="inline-block">
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            🔥 PROMOÇÃO ESPECIAL
                          </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                          {restaurant.nome}
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-200 max-w-md leading-relaxed">
                          {restaurant.descricao || "Descontos especiais e ofertas imperdíveis! Peça já e aproveite."}
                        </p>
                        <div className="flex flex-wrap gap-3 items-center">
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                            <span className="text-sm font-medium">⭐ {restaurant.avaliacao?.toFixed(1) || 'Novo'}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                            <span className="text-sm font-medium">⏱️ {restaurant.tempo_preparo || 30} min</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                            <span className="text-sm font-medium">🚚 €{restaurant.taxa_entrega?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        <a 
                          href={`/RestaurantMenu?id=${restaurant.id}`}
                          className="inline-block"
                        >
                          <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
                          >
                            Ver Cardápio →
                          </Button>
                        </a>
                      </div>
                      
                      {/* Restaurant Card Preview - Hidden on mobile to save space */}
                      <div className="hidden lg:block">
                        <div className="transform scale-90 opacity-95 hover:scale-95 transition-transform duration-300">
                          <RestaurantCard restaurant={restaurant} isPromotional={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only visible on desktop hover */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex gap-2">
          {restaurants.map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? 'bg-white w-8 h-2' 
                  : 'bg-white/50 hover:bg-white/70 w-2 h-2'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Slide Counter - Bottom right */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentSlide + 1} / {restaurants.length}
      </div>
    </div>
  );
}
