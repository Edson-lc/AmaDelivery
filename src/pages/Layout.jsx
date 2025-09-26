import { useMemo } from "react";

import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { RestrictedAccess } from "./layouts/RestrictedAccess";
import { RestaurantLayout } from "./layouts/RestaurantLayout";
import {
  adminNavigationItems,
  noLayoutPages,
  publicPages,
  restaurantNavigationItems,
  restaurantPages,
} from "./layouts/navigation";
import { useCurrentUser } from "./layouts/useCurrentUser";

const pageMatcher = (pages, currentPageName) => pages.includes(currentPageName);

export default function Layout({ children, currentPageName }) {
  const { currentUser, isLoading, handleLogin, handleLogout } = useCurrentUser(currentPageName);

  const isPublicPage = useMemo(() => pageMatcher(publicPages, currentPageName), [currentPageName]);
  const isNoLayoutPage = useMemo(() => pageMatcher(noLayoutPages, currentPageName), [currentPageName]);
  const isRestaurantPage = useMemo(
    () => pageMatcher(restaurantPages, currentPageName),
    [currentPageName],
  );

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
