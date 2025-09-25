import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CriarContaPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await User.create({ full_name: fullName, email, password, role: "user", status: "ativo" });
      await User.login({ email, password });
      navigate("/Dashboard");
    } catch (err) {
      setError(err?.message || "Não foi possível criar sua conta");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <p className="text-sm text-gray-600 text-center">Crie sua conta para começar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha" required />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <span>Já tem uma conta?</span>{" "}
            <Link to="/Login" className="text-orange-600 hover:underline">Entrar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

