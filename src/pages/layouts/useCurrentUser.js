import { useCallback, useEffect, useState } from "react";

import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";

const redirect = (page) => {
  if (!page || typeof window === "undefined") return;
  window.location.href = createPageUrl(page);
};

const resolveLandingPage = (user) => {
  if (!user) return "Home";
  if (user.role === "admin") return "Dashboard";
  if (user.tipo_usuario === "restaurante" && user.restaurant_id) return "RestaurantDashboard";
  if (user?.tipo_usuario === "entregador") return "PainelEntregador";
  if (user.tipo_usuario === "cliente") return "MinhaConta";
  return "Home";
};

export function useCurrentUser(currentPageName) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setCurrentUser(null);
      redirect("Home");
    }
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const user = await User.login();
      if (user) {
        setCurrentUser(user);
        redirect(resolveLandingPage(user));
      }
    } catch (error) {
      console.error("Erro ao iniciar o login:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        if (!isMounted) return;

        setCurrentUser(user);

        if (
          user &&
          user.tipo_usuario === "restaurante" &&
          user.restaurant_id &&
          currentPageName === "Home"
        ) {
          redirect("RestaurantDashboard");
          return;
        }

        if (user && user.tipo_usuario === "entregador" && currentPageName === "Home") {
          redirect("PainelEntregador");
          return;
        }
      } catch (error) {
        if (!isMounted) return;
        setCurrentUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [currentPageName]);

  return {
    currentUser,
    isLoading,
    handleLogin,
    handleLogout,
  };
}
