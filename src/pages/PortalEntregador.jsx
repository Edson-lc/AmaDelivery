
import React, { useState, useEffect } from "react";
import { User, Entregador } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Euro, Clock, Shield, TrendingUp } from "lucide-react";

export default function PortalEntregadorPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false); // Nova flag

  useEffect(() => {
    const checkUser = async () => {
      if (hasChecked) return; // Evita execuções múltiplas
      setHasChecked(true);

      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // CORREÇÃO: Usar user_id em vez de email
        if (user && user.tipo_usuario === 'entregador') {
          const drivers = await Entregador.filter({ user_id: user.id }); // Changed from email: user.email to user_id: user.id
          if (drivers.length > 0 && drivers[0].aprovado) {
            window.location.href = createPageUrl('PainelEntregador');
            return;
          }
          // Se é entregador mas não tem perfil aprovado, fica aqui (portal)
        }
      } catch (error) {
        // Not logged in, which is fine for this public page
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [hasChecked]);

  const handleStart = async () => {
    if (currentUser) {
      window.location.href = createPageUrl('CadastroEntregador');
    } else {
      try {
        await User.login();
      } catch (error) {
        console.error("Erro ao iniciar login:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <a href={createPageUrl("Home")} className="text-2xl font-bold text-white">AmaEats</a>
            <Button onClick={handleStart} variant="secondary">
              {currentUser ? 'Meu Painel' : 'Entrar'}
            </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1580993235203-ab31da80373b?q=80&w=2070&auto=format&fit=crop" alt="Entregador de moto à noite"/>
            <div className="absolute inset-0 bg-gray-900 opacity-60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                Seja um entregador parceiro. <span className="text-orange-500">Faça seu horário.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                Ganhe dinheiro nas suas próprias condições. Junte-se à nossa rede e comece a entregar hoje mesmo.
            </p>
            <div className="mt-10">
                <Button size="lg" className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700" onClick={handleStart}>
                    Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Vantagens de ser nosso parceiro</h2>
            <p className="mt-4 text-lg text-gray-600">Descubra por que milhares de entregadores escolhem a AmaEats.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto">
                <Euro className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Ganhos Competitivos</h3>
              <p className="mt-2 text-base text-gray-600">Receba por cada entrega e fique com 100% das gorjetas. Pagamentos semanais direto na sua conta.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Flexibilidade Total</h3>
              <p className="mt-2 text-base text-gray-600">Você decide quando e por quanto tempo quer entregar. Sem chefe, sem horários fixos.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Suporte e Segurança</h3>
              <p className="mt-2 text-base text-gray-600">Nossa equipe de suporte está disponível 24/7 para te ajudar com qualquer problema durante as entregas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} AmaEats. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
