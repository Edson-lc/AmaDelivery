import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, ShoppingBag } from "lucide-react";

export function RestaurantLayout({ children, navigationItems, onLogout }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-red-50">
        <Sidebar
          className={`border-r border-orange-200 bg-white/80 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
        >
          <SidebarHeader className="border-b border-orange-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:opacity-90"
                title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                onClick={() => setIsCollapsed((previous) => !previous)}
              >
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
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url.split("?")[0]
                            ? "bg-orange-100 text-orange-700 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        <Link
                          to={item.url}
                          aria-label={item.title}
                          className={isCollapsed ? "flex items-center justify-center p-3" : "flex items-center gap-3 px-4 py-3"}
                        >
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
                    onClick={() => window.open(createPageUrl("Home"), "_blank")}
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onLogout}
                  className={`text-red-600 hover:bg-red-50 focus:bg-red-50 ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  {!isCollapsed && <span className="font-medium">Sair</span>}
                </SidebarMenuButton>
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

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
