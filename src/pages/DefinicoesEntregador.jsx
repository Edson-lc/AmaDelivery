
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, FileText, LogOut, ExternalLink } from "lucide-react";

export default function DefinicoesEntregadorPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        window.location.href = createPageUrl('PortalEntregador');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Set the document title for this page, incorporating the application name
  useEffect(() => {
    document.title = "AmaEats - Definições e Privacidade";
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("PortalEntregador");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.location.href = createPageUrl('PainelEntregador')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Definições e privacidade</h1>
        </div>

        {/* Perfil do usuário */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img 
                src={user?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=f97316&color=fff&size=128`} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-orange-300 object-cover" 
              />
              <div>
                <h2 className="text-xl font-semibold">{user?.full_name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Políticas e Termos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Políticas e Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4 text-left"
              onClick={() => window.open('https://example.com/privacy', '_blank')}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Política de Privacidade</p>
                  <p className="text-sm text-gray-500">Como tratamos os seus dados</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4 text-left"
              onClick={() => window.open('https://example.com/terms', '_blank')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Termos e Condições</p>
                  <p className="text-sm text-gray-500">Regras de utilização dos serviços</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
          </CardContent>
        </Card>

        {/* Sessão */}
        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-4 text-left hover:bg-red-50"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-600">Terminar sessão</p>
                  <p className="text-sm text-gray-500">Sair da sua conta</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
