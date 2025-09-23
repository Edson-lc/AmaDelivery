
import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Home, Briefcase, MapPin } from 'lucide-react';

export default function AddressManager({ user, onUserUpdate }) {
    const [addresses, setAddresses] = useState(user.enderecos_salvos || []);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddNew = () => {
        setEditIndex(addresses.length);
        setCurrentAddress({ id: `new_${Date.now()}`, nome: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '' });
        setIsEditing(true);
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setCurrentAddress(addresses[index]);
        setIsEditing(true);
    };

    const handleDelete = async (index) => {
        setIsLoading(true);
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        try {
            const updatedUser = await User.updateMyUserData({ enderecos_salvos: updatedAddresses });
            setAddresses(updatedAddresses);
            onUserUpdate(updatedUser);
        } catch (error) {
            console.error("Erro ao deletar endereço:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        let updatedAddresses = [...addresses];
        if (editIndex === addresses.length) { // Novo endereço
            updatedAddresses.push(currentAddress);
        } else { // Editando endereço existente
            updatedAddresses[editIndex] = currentAddress;
        }

        try {
            const updatedUser = await User.updateMyUserData({ enderecos_salvos: updatedAddresses });
            setAddresses(updatedAddresses);
            onUserUpdate(updatedUser);
            setIsEditing(false);
            setCurrentAddress(null);
            setEditIndex(null);
        } catch (error) {
            console.error("Erro ao salvar endereço:", error);
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentAddress(null);
        setEditIndex(null);
    };

    const handleInputChange = (field, value) => {
        setCurrentAddress(prev => ({ ...prev, [field]: value }));
    };

    if (isEditing) {
        return (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{editIndex === addresses.length ? 'Adicionar Novo Endereço' : 'Editar Endereço'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="nome">Nome do Endereço (ex: Casa, Trabalho)</Label>
                        <Input id="nome" value={currentAddress.nome} onChange={e => handleInputChange('nome', e.target.value)} className="h-12" />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="rua">Rua</Label>
                        <Input id="rua" value={currentAddress.rua} onChange={e => handleInputChange('rua', e.target.value)} className="h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" value={currentAddress.numero} onChange={e => handleInputChange('numero', e.target.value)} className="h-12" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input id="complemento" value={currentAddress.complemento} onChange={e => handleInputChange('complemento', e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" value={currentAddress.bairro} onChange={e => handleInputChange('bairro', e.target.value)} className="h-12" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input id="cidade" value={currentAddress.cidade} onChange={e => handleInputChange('cidade', e.target.value)} className="h-12" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="cep">Código Postal</Label>
                        <Input id="cep" value={currentAddress.cep} onChange={e => handleInputChange('cep', e.target.value)} className="h-12" />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={handleCancel} className="h-12 text-base font-medium touch-manipulation">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="h-12 text-base font-medium touch-manipulation">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Meus Endereços</CardTitle>
                    <CardDescription>Gerencie seus endereços de entrega.</CardDescription>
                </div>
                <Button onClick={handleAddNew} className="h-12 px-6 text-base font-medium touch-manipulation">
                    <Plus className="mr-2 h-5 w-5" />
                    Adicionar
                </Button>
            </CardHeader>
            <CardContent>
                {addresses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum endereço salvo.</p>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-100 p-3 rounded-full">
                                        <MapPin className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{address.nome}</p>
                                        <p className="text-sm text-gray-600">{`${address.rua}, ${address.numero} - ${address.cidade}`}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="lg" 
                                        className="h-12 w-12 touch-manipulation"
                                        onClick={() => handleEdit(index)}
                                    >
                                        <Plus className="h-5 w-5 transform rotate-45" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="lg" 
                                        className="h-12 w-12 touch-manipulation text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(index)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
