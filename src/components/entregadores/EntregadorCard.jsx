import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Truck,
  Mail, 
  Phone, 
  Calendar,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  inativo: "bg-gray-100 text-gray-800 border-gray-200",
  suspenso: "bg-red-100 text-red-800 border-red-200"
};

const vehicleIcons = {
  moto: "🏍️",
  carro: "🚗",
  bicicleta: "🚲",
  pe: "🚶"
};

export default function EntregadorCard({ entregador, onEdit, onViewDetails, onApprove, onReject }) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(entregador.nome_completo || 'E')}&background=f97316&color=fff`;

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={entregador.foto_url || defaultAvatar}
              alt={entregador.nome_completo}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {entregador.nome_completo || "Nome não informado"}
              </h3>
              <p className="text-sm text-gray-600 truncate">{entregador.email}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => (onViewDetails ? onViewDetails(entregador) : onEdit?.(entregador))}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {entregador.aprovado ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">Aprovado</Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium">Pendente</Badge>
          )}
          {entregador.status && (
            <Badge className={`${statusColors[entregador.status]} border font-medium`}>
              {entregador.status}
            </Badge>
          )}
          <Badge variant="outline" className="font-medium">
            {vehicleIcons[entregador.veiculo_tipo] || '❓'} {entregador.veiculo_tipo}
          </Badge>
        </div>

        <div className="space-y-2">
          {entregador.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{entregador.telefone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Cadastrado em {format(new Date(entregador.created_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {!entregador.aprovado && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => onApprove(entregador.id)}>
                    <UserCheck className="w-4 h-4 mr-2"/>
                    Aprovar
                </Button>
                 <Button size="sm" variant="destructive" className="flex-1" onClick={() => onReject(entregador.id)}>
                    <UserX className="w-4 h-4 mr-2"/>
                    Rejeitar
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}



