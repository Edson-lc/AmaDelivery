import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const routeForUser = (user) => {
  const tipo = user?.tipo_usuario;
  const role = user?.role;
  if (role === "admin") return "/Dashboard";
  if (tipo === "entregador") return "/PainelEntregador";
  if (tipo === "restaurante") return "/RestaurantDashboard";
  return "/Home";
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await User.login({ email, password });
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || routeForUser(user));
    } catch (err) {
      setError(err?.message || "Não foi possível autenticar");
    }
    setLoading(false);
  };

  // Se já estiver autenticado, redireciona imediatamente para a rota padrão
  useEffect(() => {
    (async () => {
      try {
        const user = await User.me();
        if (user) {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          navigate(redirect || routeForUser(user));
        }
      } catch (err) {
        console.debug('Usuário não autenticado no carregamento da página de login.', err);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Entrar</CardTitle>
          <p className="text-sm text-gray-600 text-center">Acesse sua conta para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <span>Não tem uma conta?</span>{" "}
            <Link to="/CriarConta" className="text-orange-600 hover:underline">Criar conta</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
