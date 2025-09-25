import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from "@/utils";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export function PublicLayout({ children, currentUser, onLogin, onLogout }) {
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
                        src={
                          currentUser.foto_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            currentUser.full_name,
                          )}&background=f3f4f6&color=111827&size=128`
                        }
                        alt="avatar"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="hidden sm:inline text-gray-700 font-medium text-sm">
                        {currentUser.full_name?.split(" ")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <a
                        href={
                          currentUser.tipo_usuario === "entregador"
                            ? createPageUrl("PainelEntregador")
                            : currentUser.tipo_usuario === "restaurante"
                              ? createPageUrl("RestaurantDashboard")
                              : createPageUrl("MinhaConta")
                        }
                        className="flex items-center"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        {currentUser.tipo_usuario === "restaurante" ? "Painel Restaurante" : "Meu Painel"}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={onLogin}
                  variant="default"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Iniciar Sessão</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

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
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href={createPageUrl("PortalEntregador")} className="text-gray-300 hover:text-white">
                    Seja um Entregador/a
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Ajuda e Suporte
                  </a>
                </li>
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
