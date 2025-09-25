import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities"; // Changed from "@/api/entities"
import {
  LayoutDashboard,
  Store,
  Truck,
  ShoppingBag,
  BarChart3,
  Users,
  Bike,
  LogOut,
  Bell,
  Search,
  Clock,
  LogIn,
  User as UserIcon,
  Heart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminNavigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Restaurantes",
    url: createPageUrl("Restaurantes"),
    icon: Store,
  },
  {
    title: "Pedidos",
    url: createPageUrl("Pedidos"),
    icon: ShoppingBag,
  },
  {
    title: "Entregadores",
    url: createPageUrl("Entregadores"),
    icon: Truck,
  },
  {
    title: "Relatórios",
    url: createPageUrl("Relatorios"),
    icon: BarChart3,
  },
  {
    title: "Usuários",
    url: createPageUrl("Usuarios"),
    icon: Users,
  }
];

const restaurantNavigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("RestaurantDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Pedidos",
    url: createPageUrl("RestaurantDashboard?tab=orders"),
    icon: ShoppingBag,
  },
  {
    title: "Cardápio",
    url: createPageUrl("RestaurantDashboard?tab=menu"),
    icon: Store,
  },
  {
    title: "Relatórios",
    url: createPageUrl("RestaurantDashboard?tab=reports"),
    icon: BarChart3,
  }
];

// Páginas públicas que podem ter um header diferente
const publicPages = [
  "Home",
  "RestaurantMenu",
  "Checkout",
  "PortalEntregador",
  "CadastroEntregador",
];

// Páginas que não devem ter NENHUM layout
const noLayoutPages = ["MinhaConta", "PainelEntregador", "PerfilEntregador", "DefinicoesEntregador", "EntregasRecentes"];

// Páginas do restaurante
const restaurantPages = ["RestaurantDashboard"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isPublicPage = publicPages.includes(currentPageName);
  const isNoLayoutPage = noLayoutPages.includes(currentPageName);
  const isRestaurantPage = restaurantPages.includes(currentPageName);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);

        if (user && user.tipo_usuario === 'restaurante' && user.restaurant_id && currentPageName === 'Home') {
          window.location.href = createPageUrl('RestaurantDashboard');
          return;
        }

        if (user && user.tipo_usuario === 'entregador' && currentPageName === 'Home') {
          window.location.href = createPageUrl('PainelEntregador');
          return;
        }

      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [currentPageName]);

  const handleLogout = async () => {
    try {
      await User.logout();
      setCurrentUser(null);
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const resolveLandingPage = (user) => {
    if (!user) return 'Home';
    if (user.role === 'admin') return 'Dashboard';
    if (user.tipo_usuario === 'restaurante' && user.restaurant_id) return 'RestaurantDashboard';
    if (user?.tipo_usuario === 'entregador') return 'PainelEntregador';
    if (user.tipo_usuario === 'cliente') return 'MinhaConta';
    return 'Home';
  };

  const handleLogin = async () => {
    try {
      const user = await User.login();
      if (user) {
        setCurrentUser(user);
        const target = resolveLandingPage(user);
        if (target && typeof window !== 'undefined') {
          window.location.href = createPageUrl(target);
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar o login:', error);
    }
  };

  if (isNoLayoutPage) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // LAYOUT PÚBLICO
  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex-shrink-0">
                <a href={createPageUrl("Home")} className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md relative">
                    <span className="text-white text-lg font-bold">♥</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">AmaEats</span>
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 p-1 sm:pr-2">
                        <img
                          src={currentUser.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=f3f4f6&color=111827&size=128`}
                          alt="avatar"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                        />
                        <span className="hidden sm:inline text-gray-700 font-medium text-sm">
                          {currentUser.full_name?.split(' ')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <a href={currentUser.tipo_usuario === 'entregador' ? createPageUrl("PainelEntregador") : currentUser.tipo_usuario === 'restaurante' ? createPageUrl("RestaurantDashboard") : createPageUrl("MinhaConta")} className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-2" />
                          {currentUser.tipo_usuario === 'restaurante' ? 'Painel Restaurante' : 'Meu Painel'}
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={handleLogin} variant="default" className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                    <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Iniciar Sessão</span>
                    <span className="sm:hidden">Entrar</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">AmaEats</h3>
                <p className="text-gray-300 text-sm">
                  A melhor plataforma de delivery para restaurantes e clientes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Sobre Nós</a></li>
                  <li><a href={createPageUrl('PortalEntregador')} className="text-gray-300 hover:text-white">Seja um Entregador</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Ajuda e Suporte</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <p className="text-gray-300 text-sm">contact@amaeats.com</p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-6 mt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} AmaEats. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // LAYOUT RESTAURANTE
  if (isRestaurantPage) {
    if (!currentUser || (currentUser.tipo_usuario !== 'restaurante' && currentUser.role !== 'admin')) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">Esta área é exclusiva para restaurantes parceiros.</p>
            <Button onClick={() => window.location.href = createPageUrl('Home')}>
              Voltar para Home
            </Button>
          </div>
        </div>
      );
    }

    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-red-50">
          <Sidebar className={"border-r border-orange-200 bg-white/80 backdrop-blur-sm transition-all duration-300 " + (isCollapsed ? "w-16" : "w-64")}>
            <SidebarHeader className="border-b border-orange-100 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:opacity-90" title={isCollapsed ? "Expandir menu" : "Recolher menu"} onClick={() => setIsCollapsed((p) => !p)}>
                  <span className="text-white text-lg font-bold">♥</span>
                </div>
                <div className={isCollapsed ? "hidden" : "block"}>
                  <h2 className="font-bold text-sm sm:text-base text-gray-900">AmaEats</h2>
                  <p className="text-xs text-orange-600">Portal do Restaurante</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 hidden">
                  Menu Principal
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {restaurantNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-lg ${
                            location.pathname === item.url.split('?')[0] ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-600'
                          }`}
                        >
                          <Link to={item.url} aria-label={item.title} className={isCollapsed ? "flex items-center justify-center p-3" : "flex items-center gap-3 px-4 py-3"}>
                            <item.icon className="w-6 h-6" />
                            {!isCollapsed && <span className="font-medium">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-8 hidden">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Acesso Rápido
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open(createPageUrl("Home"), '_blank')}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Ver Loja Pública
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-orange-100">
              <SidebarMenu>
                <SidebarMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                  icon={LogOut}
                >
                  Sair
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white border-b border-orange-200 px-4 sm:px-6 py-3 sm:py-4 md:hidden">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200" />
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">AmaEats</h1>
                  <Badge className="bg-orange-500 text-xs">Restaurante</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-orange-50 w-8 h-8">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // LAYOUT ADMIN
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => window.location.href = createPageUrl('Home')}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  // LAYOUT ADMIN - verifica permissão mas não redireciona automaticamente
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => window.location.href = createPageUrl('Home')}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-red-50">
        <Sidebar className={"border-r border-orange-200 bg-white/80 backdrop-blur-sm transition-all duration-300 " + (isCollapsed ? "w-16" : "w-64")}>
          <SidebarHeader className="border-b border-orange-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">♥</span>
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-gray-900">AmaEats</h2>
                <p className="text-xs text-orange-600">Sistema de Gestão</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} aria-label={item.title} className="flex items-center justify-center p-3">
                          <item.icon className="w-6 h-6" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8 hidden">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Acesso Rápido
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(createPageUrl("Home"), '_blank')}
                  ></Button>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Ver Loja Pública
                  
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'Admin')}&background=f97316&color=fff`}
                    alt="Admin"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.full_name?.split(' ')[0] || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-orange-200 px-4 sm:px-6 py-3 sm:py-4 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">AmaEats</h1>
                <Badge className="bg-orange-500 text-xs">Admin</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-orange-50 w-8 h-8">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}