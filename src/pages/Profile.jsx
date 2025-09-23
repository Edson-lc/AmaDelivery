
import React, { useState, useEffect, useCallback } from "react";
import { User, Entregador, AlteracaoPerfil } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, LogOut, ShieldCheck, Clock, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [pendingChange, setPendingChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const drivers = await Entregador.filter({ email: user.email });
      if (drivers.length > 0) {
        const driver = drivers[0];
        setDriverProfile(driver);
        setFormData(driver);
        // Verificar se há uma alteração pendente
        const pending = await AlteracaoPerfil.filter({ entregador_id: driver.id, status: "pendente" });
        if (pending.length > 0) {
          setPendingChange(pending[0]);
        }
      } else {
        setFormData(user);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setMessage({ type: "error", content: "Não foi possível carregar seus dados." });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("login"); // Assuming a login page exists
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", content: "" });

    try {
      if (driverProfile) {
        // Entregador: cria uma solicitação de alteração
        await AlteracaoPerfil.create({
          entregador_id: driverProfile.id,
          dados_antigos: driverProfile,
          dados_novos: formData,
          status: "pendente"
        });
        setMessage({ type: "success", content: "Sua solicitação de alteração foi enviada para aprovação." });
        setPendingChange({ status: "pendente" }); // Update UI to show pending status
      } else {
        // Admin/Usuário comum: atualiza direto
        await User.updateMyUserData(formData);
        setMessage({ type: "success", content: "Perfil atualizado com sucesso!" });
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setMessage({ type: "error", content: "Ocorreu um erro ao salvar seu perfil." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  const defaultPhoto = `https://avatar.vercel.sh/${currentUser?.email}.png`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img src={currentUser.foto_url || defaultPhoto} alt="Foto de Perfil" className="w-16 h-16 rounded-full border-2 border-orange-200" />
              <div>
                <CardTitle className="text-2xl">{currentUser.full_name}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {pendingChange && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="flex flex-row items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <CardTitle className="text-yellow-800">Alteração Pendente</CardTitle>
                <CardDescription className="text-yellow-700">
                  Você tem uma solicitação de alteração de perfil aguardando aprovação. Novas alterações só poderão ser feitas após a revisão da atual.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Minhas Informações</CardTitle>
              <CardDescription>Mantenha seus dados sempre atualizados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input id="nome_completo" value={formData.nome_completo || ''} onChange={(e) => handleInputChange('nome_completo', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} />
                </div>
              </div>

              {driverProfile && (
                <>
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <Label htmlFor="veiculo_tipo">Tipo de Veículo</Label>
                      <Select value={formData.veiculo_tipo || 'moto'} onValueChange={(v) => handleInputChange('veiculo_tipo', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bicicleta">Bicicleta</SelectItem>
                          <SelectItem value="moto">Moto</SelectItem>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="pe">A pé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="veiculo_placa">Placa do Veículo</Label>
                      <Input id="veiculo_placa" value={formData.veiculo_placa || ''} onChange={(e) => handleInputChange('veiculo_placa', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="nome_banco">Nome do Banco</Label>
                      <Input id="nome_banco" value={formData.nome_banco || ''} onChange={(e) => handleInputChange('nome_banco', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input id="iban" value={formData.iban || ''} onChange={(e) => handleInputChange('iban', e.target.value)} />
                    </div>
                  </div>
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="disponivel">Disponível para entregas</Label>
                      <Switch id="disponivel" checked={formData.disponivel} onCheckedChange={(c) => handleInputChange('disponivel', c)} />
                    </div>
                </>
              )}
               {message.content && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {message.content}
                  </div>
                )}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Encerrar Sessão
            </Button>
            <Button type="submit" disabled={isSaving || pendingChange} className="bg-gradient-to-r from-orange-500 to-red-500">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
