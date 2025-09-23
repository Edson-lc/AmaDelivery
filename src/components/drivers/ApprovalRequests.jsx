import React, { useState, useEffect, useCallback } from "react";
import { Entregador, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, User as UserIcon } from "lucide-react";

export default function ApprovalRequests({ onAction }) {
    const [pendingDrivers, setPendingDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPendingDrivers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await Entregador.filter({ aprovado: false });
            setPendingDrivers(data);
        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadPendingDrivers();
    }, [loadPendingDrivers]);

    const handleApproval = async (driver, isApproved) => {
        try {
            if(isApproved) {
                await Entregador.update(driver.id, { aprovado: true, status: 'ativo' });
                 await User.update(driver.user_id, { tipo_usuario: 'entregador' });
            } else {
                // Optionally, delete the profile or mark as rejected
                await Entregador.delete(driver.id); 
            }
            loadPendingDrivers();
            if (onAction) onAction(); // Notify parent to refresh main list
        } catch(error) {
            console.error(`Erro ao ${isApproved ? 'aprovar' : 'rejeitar'} entregador:`, error)
        }
    };

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Solicitações de Cadastro</CardTitle>
                    <Button variant="ghost" size="icon" onClick={loadPendingDrivers} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <CardDescription>Aprove ou rejeite os novos entregadores cadastrados.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : pendingDrivers.length === 0 ? (
                    <div className="text-center py-10">
                        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação pendente</h3>
                        <p className="mt-1 text-sm text-gray-500">Não há novos cadastros para analisar no momento.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingDrivers.map(driver => (
                            <div key={driver.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={driver.foto_url} alt={driver.nome_completo} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{driver.nome_completo}</p>
                                        <p className="text-sm text-gray-500">{driver.email}</p>
                                        <Badge variant="secondary" className="mt-1">{driver.veiculo_tipo}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => handleApproval(driver, false)}>
                                        <X className="w-4 h-4 mr-2" /> Rejeitar
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproval(driver, true)}>
                                        <Check className="w-4 h-4 mr-2" /> Aprovar
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