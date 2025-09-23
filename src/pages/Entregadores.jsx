import React, { useState, useEffect, useCallback } from "react";
import { Entregador, AlteracaoPerfil } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Truck, 
  Search, 
  Clock, 
  CheckCircle, 
  UserPlus,
  AlertCircle,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import EntregadorCard from "../components/entregadores/EntregadorCard";
import EntregadorForm from "../components/entregadores/EntregadorForm";
import EntregadorDetails from "../components/entregadores/EntregadorDetails"; // New import for EntregadorDetails

export default function EntregadoresPage() {
  const [entregadores, setEntregadores] = useState([]);
  const [filteredEntregadores, setFilteredEntregadores] = useState([]);
  const [solicitacoesAlteracao, setSolicitacoesAlteracao] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingEntregador, setEditingEntregador] = useState(null);
  const [selectedEntregador, setSelectedEntregador] = useState(null); // New state
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null); // Add this state

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const filterAndSortEntregadores = useCallback(() => {
    let filtered = [...entregadores];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(driver =>
        driver.nome_completo?.toLowerCase().includes(lowerSearchTerm) ||
        driver.email?.toLowerCase().includes(lowerSearchTerm) ||
        driver.telefone?.includes(lowerSearchTerm)
      );
    }
    
    if (statusFilter !== "todos") {
        if(statusFilter === "pendente") {
            filtered = filtered.filter(driver => !driver.aprovado);
        } else {
            filtered = filtered.filter(driver => driver.aprovado && driver.status === statusFilter);
        }
    }

    // Ordenar: pendentes primeiro, depois por data de criação
    filtered.sort((a, b) => {
        if (!a.aprovado && b.aprovado) return -1;
        if (a.aprovado && !b.aprovado) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
    });

    setFilteredEntregadores(filtered);
  }, [searchTerm, statusFilter, entregadores]);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [driversData, alteracoes] = await Promise.all([
        Entregador.list('-created_date'),
        AlteracaoPerfil.filter({ status: 'pendente' }),
      ]);
      setEntregadores(driversData);
      setSolicitacoesAlteracao(alteracoes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    filterAndSortEntregadores();
  }, [filterAndSortEntregadores]);

  const handleSubmit = async (formData) => {
    try {
      if (editingEntregador) {
        await Entregador.update(editingEntregador.id, formData);
      } else {
        await Entregador.create({ ...formData, aprovado: true }); // Admin-created are pre-approved
      }
      setShowForm(false);
      setEditingEntregador(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar entregador:", error);
    }
  };

  const handleEdit = (entregador) => {
    setEditingEntregador(entregador);
    setShowForm(true);
  };

  const handleViewDetails = (entregador) => {
    setSelectedEntregador(entregador);
    setSelectedSolicitacao(null); // Limpa solicitação para não misturar contextos
  };
  
  const handleApprove = async (driverId) => {
    try {
      await Entregador.update(driverId, { aprovado: true, status: 'ativo' });
      await loadData();
    } catch (error) {
      console.error("Erro ao aprovar entregador:", error);
    }
  };

  const handleReject = async (driverId) => {
    try {
      // Idealmente, isso deveria apagar ou marcar como 'rejeitado'
      // Por agora, vamos apenas marcar como suspenso para não perder o registo
      await Entregador.update(driverId, { aprovado: false, status: 'suspenso' });
      await loadData();
    } catch (error) {
      console.error("Erro ao rejeitar entregador:", error);
    }
  };
  
  const handleApproveChange = async (change) => {
    try {
      await Entregador.update(change.entregador_id, change.dados_novos);
      await AlteracaoPerfil.update(change.id, { status: 'aprovado' });
      await loadData();
    } catch (error) {
      console.error("Erro ao aprovar alteração:", error);
    }
  };

  const handleRejectChange = async (changeId) => {
    try {
      await AlteracaoPerfil.update(changeId, { status: 'rejeitado' });
      await loadData();
    } catch (error) {
      console.error("Erro ao rejeitar alteração:", error);
    }
  };

  const pendingApprovalCount = entregadores.filter(e => !e.aprovado).length;
  const activeDriversCount = entregadores.filter(e => e.aprovado && e.status === 'ativo').length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Entregadores</h1>
            <p className="text-gray-600 mt-2">Gerencie todos os entregadores e suas solicitações</p>
          </div>
          <Button 
            onClick={() => { setShowForm(true); setEditingEntregador(null); setSelectedEntregador(null); setSelectedSolicitacao(null); }}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Entregador
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-gray-900">{entregadores.length}</p></div><Users className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{pendingApprovalCount}</p></div><Clock className="w-8 h-8 text-yellow-500" /></div></CardContent></Card>
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Ativos</p><p className="text-2xl font-bold text-green-600">{activeDriversCount}</p></div><CheckCircle className="w-8 h-8 text-green-500" /></div></CardContent></Card>
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Alterações</p><p className="text-2xl font-bold text-purple-600">{solicitacoesAlteracao.length}</p></div><AlertCircle className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
        </div>
        
        {solicitacoesAlteracao.length > 0 && (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-500" />
                        Solicitações de Alteração de Perfil Pendentes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {solicitacoesAlteracao.map(solicitacao => {
                        const entregador = entregadores.find(e => e.id === solicitacao.entregador_id);
                        return (
                            <div key={solicitacao.id} className="p-3 bg-purple-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{entregador?.nome_completo || 'Entregador'}</p>
                                    <p className="text-sm text-gray-600">Solicitou alterações em {format(new Date(solicitacao.created_date), 'dd/MM/yy', { locale: ptBR })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => {
                                        setSelectedEntregador(entregador);
                                        setSelectedSolicitacao(solicitacao);
                                      }}
                                    >
                                      Ver Detalhes
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        )}

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Buscar por nome, email ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm">
                  <option value="todos">Todos Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {showForm ? (
          <EntregadorForm
            entregador={editingEntregador}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingEntregador(null); }}
          />
        ) : selectedEntregador ? (
          <EntregadorDetails
            entregador={selectedEntregador}
            solicitacaoAlteracao={selectedSolicitacao}
            onBack={() => {
              setSelectedEntregador(null);
              setSelectedSolicitacao(null);
            }}
            onApprove={async (item) => {
              if (selectedSolicitacao) {
                await handleApproveChange(selectedSolicitacao);
              } else {
                await handleApprove(item);
              }
              setSelectedEntregador(null);
              setSelectedSolicitacao(null);
            }}
            onReject={async (item) => {
              if (selectedSolicitacao) {
                await handleRejectChange(selectedSolicitacao.id);
              } else {
                await handleReject(item);
              }
              setSelectedEntregador(null);
              setSelectedSolicitacao(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <Card key={i} className="h-64 animate-pulse bg-gray-200" />)
            ) : filteredEntregadores.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum entregador encontrado</h3>
              </div>
            ) : (
              filteredEntregadores.map((entregador) => (
                <EntregadorCard
                  key={entregador.id}
                  entregador={entregador}
                  onEdit={handleEdit}
                  onViewDetails={() => handleViewDetails(entregador)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}