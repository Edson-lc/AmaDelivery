
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User as UserIcon, LogOut, ShoppingBag, MapPin, CreditCard, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

import OrderHistory from "../components/account/OrderHistory";
import AddressManager from "../components/account/AddressManager";
import ProfileForm from "../components/account/ProfileForm";
import PaymentMethods from "../components/account/PaymentMethods";

export default function MinhaContaPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                window.location.href = createPageUrl("Home");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl("Home");
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            const updatedUser = await User.updateMyUserData({ foto_url: file_url });
            setUser(updatedUser);
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            alert("Não foi possível enviar a imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }
    
    const userFullName = `${user.nome || ''} ${user.sobrenome || ''}`.trim() || user.email;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=f97316&color=fff`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <a href={createPageUrl("Home")} className="text-xl font-bold text-orange-600">AmaEats</a>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Olá, {user.nome || user.full_name.split(' ')[0]}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2"/>Sair</Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Tabs defaultValue="perfil" className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Sidebar de Navegação */}
                        <div className="md:col-span-1">
                            <Card className="p-4 border-none shadow-lg bg-white/80 backdrop-blur-sm">
                                <div className="flex flex-col items-center text-center gap-4 mb-6">
                                    <div className="relative group">
                                        <img src={user.foto_url || defaultAvatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-orange-200" />
                                        <button 
                                            onClick={handleImageClick}
                                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity cursor-pointer"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 
                                                <Loader2 className="w-6 h-6 text-white animate-spin" /> : 
                                                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            }
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/gif"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">{userFullName}</h2>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full space-y-1">
                                     <TabsTrigger value="perfil" className="w-full justify-start gap-3 text-base py-3 px-4 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm border-0 rounded-lg">
                                        <UserIcon className="w-5 h-5" />
                                        Dados Pessoais
                                    </TabsTrigger>
                                    <TabsTrigger value="pedidos" className="w-full justify-start gap-3 text-base py-3 px-4 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm border-0 rounded-lg">
                                        <ShoppingBag className="w-5 h-5" />
                                        Meus Pedidos
                                    </TabsTrigger>
                                    <TabsTrigger value="enderecos" className="w-full justify-start gap-3 text-base py-3 px-4 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm border-0 rounded-lg">
                                        <MapPin className="w-5 h-5" />
                                        Endereços
                                    </TabsTrigger>
                                    <TabsTrigger value="pagamento" className="w-full justify-start gap-3 text-base py-3 px-4 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm border-0 rounded-lg">
                                        <CreditCard className="w-5 h-5" />
                                        Pagamento
                                    </TabsTrigger>
                                </TabsList>
                            </Card>
                        </div>

                        {/* Conteúdo das Abas */}
                        <div className="md:col-span-3">
                            <TabsContent value="perfil" className="mt-0">
                                <ProfileForm user={user} onUserUpdate={handleUserUpdate} />
                            </TabsContent>
                             <TabsContent value="pedidos" className="mt-0">
                                <OrderHistory userEmail={user.email} />
                            </TabsContent>
                            <TabsContent value="enderecos" className="mt-0">
                                <AddressManager user={user} onUserUpdate={handleUserUpdate} />
                            </TabsContent>
                            <TabsContent value="pagamento" className="mt-0">
                                <PaymentMethods user={user} onUserUpdate={handleUserUpdate} />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}
