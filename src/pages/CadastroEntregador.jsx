import React, { useState, useEffect } from "react";
import { User, Entregador } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function CadastroEntregadorPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [driverProfile, setDriverProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nome_completo: '',
        telefone: '',
        nif: '',
        data_nascimento: '',
        foto_url: '',
        veiculo_tipo: 'moto',
        veiculo_placa: '',
        iban: '',
        nome_banco: '',
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        const loadUserAndProfile = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                setFormData(prev => ({
                    ...prev,
                    nome_completo: user.full_name || '',
                    telefone: user.telefone || '',
                    foto_url: user.foto_url || '',
                }));

                const drivers = await Entregador.filter({ email: user.email });
                if (drivers.length > 0) {
                    setDriverProfile(drivers[0]);
                    if (drivers[0].aprovado) {
                        setStep(3); // Já aprovado
                    } else {
                        setStep(2); // Cadastro pendente
                    }
                }
            } catch (error) {
                window.location.href = createPageUrl('PortalEntregador');
            } finally {
                setIsLoading(false);
            }
        };
        loadUserAndProfile();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        setIsSaving(true);
        setMessage({ type: '', content: '' });

        try {
            let photoUrl = formData.foto_url;
            if (file) {
                const { file_url } = await UploadFile({ file });
                photoUrl = file_url;
            }

            const finalData = {
                ...formData,
                foto_url: photoUrl,
                email: currentUser.email,
                user_id: currentUser.id,
            };

            await Entregador.create(finalData);

            // Atualiza tipo do usuário para entregador
            await User.update(currentUser.id, { tipo_usuario: 'entregador' });

            setStep(2); // Avança para o passo de "pendente"

        } catch (error) {
            console.error("Erro ao cadastrar entregador:", error);
            setMessage({ type: 'error', content: 'Erro ao enviar cadastro. Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                {step === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-2xl">Cadastro de Entregador</CardTitle>
                            <CardDescription>Preencha os dados abaixo para começar a entregar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Informações Pessoais</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="nome_completo">Nome Completo</Label>
                                            <Input id="nome_completo" value={formData.nome_completo} onChange={e => handleInputChange('nome_completo', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <Input id="telefone" value={formData.telefone} onChange={e => handleInputChange('telefone', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="nif">NIF</Label>
                                            <Input id="nif" value={formData.nif} onChange={e => handleInputChange('nif', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                            <Input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={e => handleInputChange('data_nascimento', e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="foto">Foto de Perfil</Label>
                                    <Input id="foto" type="file" onChange={handleFileChange} />
                                    {formData.foto_url && !file && <img src={formData.foto_url} alt="preview" className="w-20 h-20 rounded-full mt-2"/>}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Veículo e Pagamento</h3>
                                     <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="veiculo_tipo">Tipo de Veículo</Label>
                                            <Select value={formData.veiculo_tipo} onValueChange={v => handleInputChange('veiculo_tipo', v)}>
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
                                            <Label htmlFor="veiculo_placa">Placa (se aplicável)</Label>
                                            <Input id="veiculo_placa" value={formData.veiculo_placa} onChange={e => handleInputChange('veiculo_placa', e.target.value)} />
                                        </div>
                                         <div className="space-y-1">
                                            <Label htmlFor="nome_banco">Nome do Banco</Label>
                                            <Input id="nome_banco" value={formData.nome_banco} onChange={e => handleInputChange('nome_banco', e.target.value)} required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="iban">IBAN</Label>
                                            <Input id="iban" value={formData.iban} onChange={e => handleInputChange('iban', e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                {message.content && <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.content}</p>}

                                <Button type="submit" className="w-full" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Enviar Cadastro
                                </Button>
                            </form>
                        </CardContent>
                    </>
                )}

                {step === 2 && (
                    <CardContent className="text-center p-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold mb-2">Cadastro Enviado!</h2>
                        <p className="text-gray-600 mb-6">Seus dados foram enviados para análise. Avisaremos por e-mail assim que seu perfil for aprovado.</p>
                        <Button onClick={() => window.location.href = createPageUrl('Home')}>Voltar para a Home</Button>
                    </CardContent>
                )}

                {step === 3 && (
                     <CardContent className="text-center p-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold mb-2">Seu cadastro está Aprovado!</h2>
                        <p className="text-gray-600 mb-6">Você já pode começar a fazer entregas e ganhar dinheiro.</p>
                        <Button onClick={() => window.location.href = createPageUrl('PainelEntregador')}>
                            Ir para o Painel de Entregas <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}