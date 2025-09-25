import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Truck, Star, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DeliveryDriverCard({ driver, onEdit, onViewDetails }) {
    const statusConfig = {
        ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
        inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
        suspenso: { label: 'Suspenso', color: 'bg-red-100 text-red-800' },
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img src={driver.foto_url} alt={driver.nome_completo} className="w-16 h-16 rounded-full object-cover"/>
                        <div>
                            <CardTitle>{driver.nome_completo}</CardTitle>
                            <Badge className={statusConfig[driver.status]?.color || 'bg-gray-100'}>
                                {statusConfig[driver.status]?.label || driver.status}
                            </Badge>
                             <Badge variant={driver.disponivel ? "default" : "outline"} className={`ml-2 ${driver.disponivel ? "bg-green-500" : ""}`}>
                                {driver.disponivel ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onViewDetails(driver)}>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(driver)}>Editar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500"/>{driver.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500"/>{driver.telefone}</div>
                    <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-500"/>{driver.veiculo_tipo}</div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                    <div className="text-center">
                        <p className="font-bold text-lg">{driver.avaliacao.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avaliação</p>
                    </div>
                     <div className="text-center">
                        <p className="font-bold text-lg">{driver.total_entregas}</p>
                        <p className="text-xs text-gray-500">Entregas</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}