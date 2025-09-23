
import React, { useState, useEffect, useCallback } from "react";
import { Restaurant, MenuItem, Cart } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Search,
  ShoppingCart,
  ThumbsUp,
  Sparkles,
  Info
} from "lucide-react";

import MenuItemCard from "../components/public/MenuItemCard";
import CartSidebar from "../components/public/CartSidebar";
import { toast, Toaster } from "sonner"; // Added Toaster import

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  // Changed initial cart state to null, it will be loaded asynchronously
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Added sessionId state

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');

  // Helper to get or create session ID and update state
  const getOrCreateSessionId = useCallback(() => {
    let currentSessionId = localStorage.getItem('delivery_session_id');
    if (!currentSessionId) {
      currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('delivery_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);
    return currentSessionId;
  }, []);

  // Initialize session and load cart
  const initializeSessionAndCart = useCallback(async (currentRestaurantId) => {
    if (!currentRestaurantId) return;

    const currentSessionId = getOrCreateSessionId(); // Get or create session ID and update state

    try {
      const cartData = await Cart.filter({ session_id: currentSessionId, restaurant_id: currentRestaurantId });
      if (cartData && cartData.length > 0) {
        setCart(cartData[0]);
      } else {
        // Initialize an empty cart if none found
        setCart({ itens: [], subtotal: 0, session_id: currentSessionId, restaurant_id: currentRestaurantId });
      }
    } catch (error) {
      console.error("Erro ao carregar ou inicializar carrinho:", error);
      toast.error("Não foi possível carregar seu carrinho. Tente novamente.");
    }
  }, [getOrCreateSessionId]);

  const loadData = useCallback(async () => {
    if (!restaurantId) return;

    setIsLoading(true);
    try {
      const [restaurantData, itemsData] = await Promise.all([
        Restaurant.get(restaurantId),
        MenuItem.filter({ restaurant_id: restaurantId, disponivel: true }),
      ]);

      setRestaurant(restaurantData);
      setMenuItems(itemsData);
      // Initialize session and cart after restaurant and menu items are loaded
      await initializeSessionAndCart(restaurantId);
    } catch (error) {
      console.error("Erro ao carregar dados do cardápio:", error);
      toast.error("Não foi possível carregar os dados do restaurante. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, initializeSessionAndCart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterAndGroupItems = useCallback(() => {
    let filtered = menuItems.filter(item =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, item) => {
      const category = item.categoria || 'outros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
    setGroupedItems(grouped);

    if (!activeCategory && Object.keys(grouped).length > 0) {
      setActiveCategory(Object.keys(grouped)[0]);
    }
  }, [menuItems, searchTerm, activeCategory]);

  useEffect(() => {
    filterAndGroupItems();
  }, [filterAndGroupItems]);

  // Removed original getSessionId as it's now handled by getOrCreateSessionId and stored in state

  const updateCart = async (newCartData) => {
    if (!sessionId || !restaurantId) {
      toast.error("Erro: ID de sessão ou restaurante não disponível.");
      console.error("Session ID or Restaurant ID missing for cart update.");
      return;
    }

    const subtotal = (newCartData.itens || []).reduce((total, item) => {
      const itemTotal = item.preco_unitario * item.quantidade;
      const adicionaisTotal = (item.adicionais || []).reduce((sum, add) => sum + add.preco, 0) * item.quantidade;
      return total + itemTotal + adicionaisTotal;
    }, 0);

    const cartPayload = {
      ...newCartData,
      subtotal,
      session_id: sessionId, // Use state sessionId
      restaurant_id: restaurantId,
      data_atualizacao: new Date().toISOString()
    };

    try {
      let updatedCart;
      if (cart && cart.id) { // Check if cart exists and has an ID
        await Cart.update(cart.id, cartPayload);
        updatedCart = { ...cartPayload, id: cart.id };
      } else {
        const newCart = await Cart.create({ ...cartPayload, data_criacao: new Date().toISOString() });
        updatedCart = { ...cartPayload, id: newCart.id };
      }
      setCart(updatedCart);
      toast.success("Carrinho atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar carrinho:", error);
      toast.error("Erro ao atualizar o carrinho.");
    }
  };

  const addToCart = (menuItem, quantidade = 1, observacoes = "", adicionais = []) => {
    if (!cart) {
      toast.error("Carrinho não inicializado. Tente recarregar a página.");
      return;
    }

    const novoItem = {
      item_id: menuItem.id,
      nome: menuItem.nome,
      preco_unitario: menuItem.preco,
      quantidade,
      observacoes,
      adicionais
    };

    const existingItemIndex = (cart.itens || []).findIndex(item =>
      item.item_id === menuItem.id && JSON.stringify(item.adicionais) === JSON.stringify(adicionais) && item.observacoes === observacoes
    );

    let newItens = [...(cart.itens || [])];
    if (existingItemIndex >= 0) {
      newItens[existingItemIndex].quantidade += quantidade;
    } else {
      newItens.push(novoItem);
    }

    updateCart({ ...cart, itens: newItens });
  };

  const removeFromCart = (itemIndex) => {
    if (!cart) return;

    let newItens = [...(cart.itens || [])];
    newItens.splice(itemIndex, 1);
    updateCart({ ...cart, itens: newItens });
  };

  const clearCart = () => {
    if (!cart) return;
    updateCart({ ...cart, itens: [], subtotal: 0 });
  };

  const goToCheckout = () => {
    if (!cart || !cart.id) {
      toast.error("Erro: carrinho não encontrado. Tente adicionar itens novamente.");
      return;
    }
    window.location.href = createPageUrl(`Checkout?restaurant=${restaurantId}&cart=${cart.id}`);
  };

  const updateItemQuantity = async (itemIndex, newQuantity) => {
    if (!cart) return;

    if (newQuantity <= 0) {
      removeFromCart(itemIndex);
      return;
    }

    const updatedItems = [...(cart.itens || [])];
    updatedItems[itemIndex].quantidade = newQuantity;

    await updateCart({ ...cart, itens: updatedItems });
  };

  const defaultBanner = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=400&fit=crop";
  const categories = Object.keys(groupedItems);

  if (isLoading || cart === null) { // Added cart === null check to ensure cart is initialized
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Restaurante não encontrado</h2>
        <Button onClick={() => window.location.href = createPageUrl("Home")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between h-14 sm:h-16">
          <Button variant="ghost" onClick={() => window.location.href = createPageUrl("Home")} className="flex items-center gap-2 p-2 sm:p-3">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">{restaurant?.nome || "Restaurante"}</h1>
          </div>
          <div className="w-16"></div> {/* Espaço para balancear o layout */}
        </div>
      </header>

      <div className="h-32 sm:h-40 md:h-56 relative">
        <img src={restaurant?.imagem_url || defaultBanner} alt={`Banner de ${restaurant?.nome}`} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 pb-20 lg:pb-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">

          {/* Sidebar Categorias - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3 py-4">
            <div className="sticky top-20 space-y-1">
              <h3 className="font-bold text-lg px-2 mb-3">Categorias</h3>
              {categories.map(category => (
                <a
                  key={category}
                  href={`#category-${category}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(`category-${category}`).scrollIntoView({ behavior: 'smooth' }); setActiveCategory(category); }}
                  className={`block px-3 py-2 rounded-lg capitalize transition-colors text-sm ${activeCategory === category ? 'bg-orange-100 text-orange-700 font-semibold' : 'hover:bg-gray-100'}`}
                >
                  {category.replace(/_/g, ' ')}
                </a>
              ))}
            </div>
          </aside>

          {/* Menu Principal */}
          <div className="lg:col-span-6 py-4">
            <Card className="relative -mt-24 sm:-mt-28 z-10 shadow-xl border-none">
              <CardContent className="p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{restaurant?.nome}</h1>
                <div className="flex flex-wrap gap-x-3 gap-y-2 mt-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> <span>{restaurant?.avaliacao?.toFixed(1) || '4.5'} (500+)</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> <span>{restaurant?.tempo_preparo || 30}-{(restaurant?.tempo_preparo || 30) + 15} min</span></div>
                    <div className="flex items-center gap-1"><Bike className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> <span>€{restaurant?.taxa_entrega?.toFixed(2) || "2.50"}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Search Bar */}
            <div className="mt-4 sm:mt-6">
              <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"/>
                <Input
                  placeholder={`Procurar em ${restaurant?.nome || 'restaurante'}`}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Mobile Categories Navigation */}
              <div className="lg:hidden mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        document.getElementById(`category-${category}`).scrollIntoView({ behavior: 'smooth' });
                        setActiveCategory(category);
                      }}
                      className={`px-3 py-2 rounded-lg capitalize transition-colors text-sm whitespace-nowrap ${
                        activeCategory === category ? 'bg-orange-100 text-orange-700 font-semibold' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {category.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(groupedItems).length === 0 && !isLoading && (
                <div className="text-center py-12 sm:py-16">
                  <p className="text-sm sm:text-base text-gray-500">Nenhum item encontrado.</p>
                </div>
              )}

              <div className="space-y-6 sm:space-y-8">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <section key={category} id={`category-${category}`}>
                    <h2 className="text-xl sm:text-2xl font-bold capitalize flex items-center gap-2 mb-3 sm:mb-4">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500"/>
                      {category.replace(/_/g, ' ')}
                    </h2>
                    <div className="divide-y border-t border-b">
                      {items.map(item => (
                        <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Carrinho - Desktop only */}
          <aside className="hidden lg:block lg:col-span-3 py-4">
            <div className="sticky top-20">
              {/* Ensure cart is not null before passing */}
              {cart && (
                <CartSidebar
                  cart={cart}
                  restaurant={restaurant}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                  onCheckout={goToCheckout}
                  onUpdateQuantity={updateItemQuantity}
                />
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Fixed Cart Button - Mobile only */}
      {cart && cart.itens?.length > 0 && ( // Ensure cart is not null
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 border-t z-40 shadow-lg">
          <Button onClick={goToCheckout} size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Finalizar Pedido • €{cart.subtotal?.toFixed(2)}
          </Button>
        </div>
      )}
      <Toaster richColors /> {/* Added Toaster component */}
    </div>
  );
}
