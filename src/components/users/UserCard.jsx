
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleColors = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  user: "bg-blue-100 text-blue-800 border-blue-200"
};

const roleLabels = {
  admin: "Administrador",
  user: "Usuário"
};

const statusColors = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  inativo: "bg-gray-100 text-gray-800 border-gray-200",
  suspenso: "bg-red-100 text-red-800 border-red-200"
};

export default function UserCard({ user, onEdit }) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=f97316&color=fff`;

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        {/* Cabeçalho do usuário */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.foto_url || defaultAvatar}
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              {user.role === 'admin' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.full_name || "Nome não informado"}
              </h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={`${roleColors[user.role]} border font-medium`}>
            {roleLabels[user.role] || user.role}
          </Badge>
          {user.status && (
            <Badge className={`${statusColors[user.status]} border font-medium`}>
              {user.status}
            </Badge>
          )}
        </div>

        {/* Informações */}
        <div className="space-y-2">
          {user.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{user.telefone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Cadastrado em {format(new Date(user.created_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
