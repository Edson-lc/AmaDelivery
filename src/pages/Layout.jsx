import { useEffect, useState } from "react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  LayoutDashboard,
  Store,
  Truck,
  ShoppingBag,
  BarChart3,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "./layouts/PublicLayout";
import { RestaurantLayout } from "./layouts/RestaurantLayout";
import { AdminLayout } from "./layouts/AdminLayout";

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
  },
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
  },
];

const publicPages = [
  "Home",
  "RestaurantMenu",
  "Checkout",
  "PortalEntregador",
  "CadastroEntregador",
];

const noLayoutPages = [
  "MinhaConta",
  "PainelEntregador",
  "PerfilEntregador",
  "DefinicoesEntregador",
  "EntregasRecentes",
];

const restaurantPages = ["RestaurantDashboard"];

function RestrictedAccess({ title, description }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button onClick={() => (window.location.href = createPageUrl("Home"))}>
          Voltar para Home
        </Button>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPublicPage = publicPages.includes(currentPageName);
  const isNoLayoutPage = noLayoutPages.includes(currentPageName);
  const isRestaurantPage = restaurantPages.includes(currentPageName);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);

        if (user && user.tipo_usuario === "restaurante" && user.restaurant_id && currentPageName === "Home") {
          window.location.href = createPageUrl("RestaurantDashboard");
          return;
        }

        if (user && user.tipo_usuario === "entregador" && currentPageName === "Home") {
          window.location.href = createPageUrl("PainelEntregador");
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

  const resolveLandingPage = (user) => {
    if (!user) return "Home";
    if (user.role === "admin") return "Dashboard";
    if (user.tipo_usuario === "restaurante" && user.restaurant_id) return "RestaurantDashboard";
    if (user?.tipo_usuario === "entregador") return "PainelEntregador";
    if (user.tipo_usuario === "cliente") return "MinhaConta";
    return "Home";
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setCurrentUser(null);
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await User.login();
      if (user) {
        setCurrentUser(user);
        const target = resolveLandingPage(user);
        if (target && typeof window !== "undefined") {
          window.location.href = createPageUrl(target);
        }
      }
    } catch (error) {
      console.error("Erro ao iniciar o login:", error);
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

  if (isPublicPage) {
    return (
      <PublicLayout currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout}>
        {children}
      </PublicLayout>
    );
  }

  if (isRestaurantPage) {
    if (!currentUser || (currentUser.tipo_usuario !== "restaurante" && currentUser.role !== "admin")) {
      return (
        <RestrictedAccess
          title="Acesso Restrito"
          description="Esta área é exclusiva para restaurantes parceiros."
        />
      );
    }

    return (
      <RestaurantLayout navigationItems={restaurantNavigationItems} onLogout={handleLogout}>
        {children}
      </RestaurantLayout>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <RestrictedAccess
        title="Acesso Restrito"
        description="Você não tem permissão para acessar esta área."
      />
    );
  }

  return (
    <AdminLayout
      currentUser={currentUser}
      navigationItems={adminNavigationItems}
      onLogout={handleLogout}
    >
      {children}
    </AdminLayout>
  );
}
