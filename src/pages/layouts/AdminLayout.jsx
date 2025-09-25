import { Link, useLocation } from "react-router-dom";
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
import { Bell, LogOut } from "lucide-react";

export function AdminLayout({ children, currentUser, navigationItems, onLogout }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-red-50">
        <Sidebar className="border-r border-orange-200 bg-white/80 backdrop-blur-sm transition-all duration-300 w-16 lg:w-64">
          <SidebarHeader className="border-b border-orange-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">♥</span>
              </div>
              <div className="hidden lg:block">
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
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url ? "bg-orange-100 text-orange-700 shadow-sm" : "text-gray-600"
                        }`}
                      >
                        <Link to={item.url} aria-label={item.title} className="flex items-center justify-center p-3 lg:justify-start lg:px-4 lg:py-3 lg:gap-3">
                          <item.icon className="w-6 h-6" />
                          <span className="hidden lg:inline font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-orange-100">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <img
                  src={
                    currentUser?.foto_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || "Admin")}&background=f97316&color=fff`
                  }
                  alt="Admin"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.full_name?.split(" ")[0] || "Admin"}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
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

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
