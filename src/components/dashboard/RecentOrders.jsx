
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmado: "bg-blue-100 text-blue-800 border-blue-200",
  preparando: "bg-orange-100 text-orange-800 border-orange-200",
  pronto: "bg-purple-100 text-purple-800 border-purple-200",
  saiu_entrega: "bg-indigo-100 text-indigo-800 border-indigo-200",
  entregue: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  pronto: "Pronto",
  saiu_entrega: "Saiu para Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado"
};

export default function RecentOrders({ orders, isLoading }) {
  // Helper function to format address
  const formatAddress = (endereco) => {
    if (typeof endereco === 'string') return endereco;
    if (!endereco || typeof endereco !== 'object') return 'Endereço não informado';
    
    const { rua = '', numero = '', bairro = '' } = endereco;
    let addressString = '';
    if (rua) addressString += rua;
    if (numero) addressString += `, ${numero}`;
    if (bairro) addressString += ` - ${bairro}`;
    
    return addressString || 'Endereço não informado';
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            Pedidos Recentes
          </CardTitle>
          <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 bg-white/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{order.cliente_nome}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(order.created_date), "HH:mm", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Pedido #{order.id.slice(-6)}
                    </span>
                  </div>
                </div>
                <Badge className={`${statusColors[order.status]} border font-medium`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {order.itens?.length || 0} {order.itens?.length === 1 ? 'item' : 'itens'}
                </div>
                <span className="font-bold text-lg text-gray-900">
                  € {(order.total || 0).toFixed(2)}
                </span>
              </div>
              
              {order.endereco_entrega && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatAddress(order.endereco_entrega)}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
