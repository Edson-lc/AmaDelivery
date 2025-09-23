import React, { useState, useEffect } from "react";
import { User, Entregador, AlteracaoPerfil } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Clock, ShieldAlert } from "lucide-react";

export default function PerfilEntregadorPage() {
  const [driverProfile, setDriverProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [pendingChange, setPendingChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await User.me();
        const drivers = await Entregador.filter({ user_id: user.id }); // CORREÇÃO: usar user_id
        if (drivers.length === 0) throw new Error("Driver profile not found");
        
        const driver = drivers[0];
        setDriverProfile(driver);
        setFormData(driver);

        const pending = await AlteracaoPerfil.filter({ entregador_id: driver.id, status: "pendente" });
        if (pending.length > 0) {
          setPendingChange(pending[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        window.location.href = createPageUrl('PortalEntregador');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", content: "" });

    try {
        let photoUrl = formData.foto_url;
        if (file) {
            const { file_url } = await UploadFile({ file });
            photoUrl = file_url;
        }
        
        const newData = { ...formData, foto_url: photoUrl };

      await AlteracaoPerfil.create({
        entregador_id: driverProfile.id,
        dados_antigos: driverProfile,
        dados_novos: newData,
      });
      
      setMessage({ type: "success", content: "Sua solicitação de alteração foi enviada para aprovação." });
      setPendingChange({ status: "pendente" }); // Update UI to show pending status
      
    } catch (error) {
      console.error("Erro ao solicitar alteração:", error);
      setMessage({ type: "error", content: "Ocorreu um erro ao enviar sua solicitação." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
            <Button variant="outline" onClick={() => window.location.href = createPageUrl('PainelEntregador')}>
                <ArrowLeft className="w-4 h-4 mr-2"/>
                Voltar ao Painel
            </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <img src={formData.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nome_completo || 'U')}&background=f97316&color=fff&size=128`} alt="Foto" className="w-20 h-20 rounded-full border-2 border-orange-300" />
              <div>
                <CardTitle className="text-2xl">{formData.nome_completo}</CardTitle>
                <CardDescription>{formData.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {pendingChange && (
          <Card className="mt-6 border-yellow-300 bg-yellow-50">
            <CardHeader className="flex flex-row items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <CardTitle className="text-yellow-800">Alteração Pendente</CardTitle>
                <CardDescription className="text-yellow-700">
                  Você tem uma solicitação de alteração de perfil aguardando aprovação.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Informações</CardTitle>
              <CardDescription>
                Para alterar seus dados, preencha os campos e envie para aprovação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campos do formulário... */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input id="nome_completo" value={formData.nome_completo || ''} onChange={(e) => handleInputChange('nome_completo', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={formData.telefone || ''} onChange={(e) => handleInputChange('telefone', e.target.value)} />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="foto_url">Foto de Perfil</Label>
                  <Input id="foto_url" type="file" onChange={handleFileChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="veiculo_tipo">Tipo de Veículo</Label>
                    <Select value={formData.veiculo_tipo || 'moto'} onValueChange={(v) => handleInputChange('veiculo_tipo', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bicicleta">Bicicleta</SelectItem>
                            <SelectItem value="moto">Moto</SelectItem>
                            <SelectItem value="carro">Carro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="veiculo_placa">Placa do Veículo</Label>
                    <Input id="veiculo_placa" value={formData.veiculo_placa || ''} onChange={(e) => handleInputChange('veiculo_placa', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="nome_banco">Nome do Banco</Label>
                    <Input id="nome_banco" value={formData.nome_banco || ''} onChange={(e) => handleInputChange('nome_banco', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input id="iban" value={formData.iban || ''} onChange={(e) => handleInputChange('iban', e.target.value)} />
                </div>
              </div>
              {message.content && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.type === 'success' ? <Clock className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {message.content}
                  </div>
                )}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || pendingChange}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Solicitar Alteração
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}