
import React, { useState, useEffect, useCallback } from "react";
import { User, Entregador, Delivery } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Clock, 
  Euro, 
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  aguardando_aceite: { 
    label: "Aguardando", 
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock 
  },
  aceito: { 
    label: "Aceito", 
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle 
  },
  coletado: { 
    label: "Coletado", 
    color: "bg-purple-100 text-purple-800",
    icon: CheckCircle 
  },
  a_caminho: { 
    label: "A Caminho", 
    color: "bg-indigo-100 text-indigo-800",
    icon: MapPin 
  },
  entregue: { 
    label: "Entregue", 
    color: "bg-green-100 text-green-800",
    icon: CheckCircle 
  },
  cancelado: { 
    label: "Cancelado", 
    color: "bg-red-100 text-red-800",
    icon: XCircle 
  }
};

export default function EntregasRecentesPage() {
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [stats, setStats] = useState({
    totalEntregas: 0,
    entregasHoje: 0,
    ganhoTotal: 0,
    avaliacaoMedia: 0
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const driverProfile = await Entregador.filter({ user_id: user.id });
      
      if (driverProfile.length === 0) {
        throw new Error("Perfil de entregador não encontrado");
      }
      
      const driverData = driverProfile[0];
      setDriver(driverData);
      
      // Carregar entregas do entregador
      const deliveriesData = await Delivery.filter({ entregador_id: driverData.id }, '-created_date');
      setDeliveries(deliveriesData);

      // Calcular estatísticas
      const hoje = new Date().toDateString();
      const entregasHoje = deliveriesData.filter(d => 
        new Date(d.created_date).toDateString() === hoje
      ).length;
      
      const ganhoTotal = deliveriesData
        .filter(d => d.status === 'entregue')
        .reduce((sum, d) => sum + (d.valor_frete || 0), 0);
      
      const avaliacoesValidas = deliveriesData.filter(d => d.avaliacao_cliente);
      const avaliacaoMedia = avaliacoesValidas.length > 0 
        ? avaliacoesValidas.reduce((sum, d) => sum + d.avaliacao_cliente, 0) / avaliacoesValidas.length
        : 0;

      setStats({
        totalEntregas: deliveriesData.length,
        entregasHoje,
        ganhoTotal,
        avaliacaoMedia
      });
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      window.location.href = createPageUrl('PainelEntregador');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeliveries = useCallback(() => {
    let filtered = [...deliveries];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(delivery =>
        delivery.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.restaurante_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.endereco_entrega.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por aba ativa
    if (activeTab !== "todas") {
      const statusMap = {
        andamento: ["aceito", "coletado", "a_caminho"],
        concluidas: ["entregue"],
        canceladas: ["cancelado"]
      };
      
      if (statusMap[activeTab]) {
        filtered = filtered.filter(delivery => statusMap[activeTab].includes(delivery.status));
      }
    }

    setFilteredDeliveries(filtered);
  }, [deliveries, searchTerm, activeTab]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [filterDeliveries]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.location.href = createPageUrl('PainelEntregador')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entregas Recentes</h1>
              <p className="text-gray-600">Histórico das suas entregas</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalEntregas}</div>
              <p className="text-sm text-gray-600">Total Entregas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.entregasHoje}</div>
              <p className="text-sm text-gray-600">Hoje</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">€{stats.ganhoTotal.toFixed(0)}</div>
              <p className="text-sm text-gray-600">Ganho Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-current" />
                {stats.avaliacaoMedia.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Avaliação</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, restaurante ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Entregas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white mb-4 w-full">
            <TabsTrigger value="todas" className="flex-1">Todas ({deliveries.length})</TabsTrigger>
            <TabsTrigger value="andamento" className="flex-1">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluidas" className="flex-1">Concluídas</TabsTrigger>
            <TabsTrigger value="canceladas" className="flex-1">Canceladas</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {filteredDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma entrega encontrada
                  </h3>
                  <p className="text-gray-500">
                    Não há entregas que correspondam aos filtros selecionados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDeliveries.map((delivery) => (
                <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header da Entrega */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={statusConfig[delivery.status]?.color}>
                              {statusConfig[delivery.status]?.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {format(new Date(delivery.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            €{delivery.valor_frete.toFixed(2)}
                          </div>
                        </div>

                        {/* Detalhes da Entrega */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Restaurante:</p>
                            <p className="font-medium">{delivery.restaurante_nome}</p>
                            <p className="text-xs text-gray-500">{delivery.endereco_coleta}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                            <p className="font-medium">{delivery.cliente_nome}</p>
                            <p className="text-xs text-gray-500">{delivery.endereco_entrega}</p>
                          </div>
                        </div>

                        {/* Estatísticas da Entrega */}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{delivery.distancia_km?.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{delivery.tempo_estimado_min} min</span>
                          </div>
                          {delivery.avaliacao_cliente && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{delivery.avaliacao_cliente.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Comentário do Cliente */}
                        {delivery.comentario_cliente && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">&ldquo;{delivery.comentario_cliente}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
