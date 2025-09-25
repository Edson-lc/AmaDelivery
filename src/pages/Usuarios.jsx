import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import UserForm from "../components/users/UserForm";
import UserCard from "../components/users/UserCard";

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefone?.includes(searchTerm)
      );
    }

    if (roleFilter !== "todos") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userData = await User.list('-created_date');
      setUsers(userData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (userData) => {
    try {
      const safeData = userData || {};
      if (editingUser) {
        await User.update(editingUser.id, safeData);
      } else {
        await User.create(safeData);
      }
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  const handleEdit = (user) => {
    // Enriquecer com campo 'endereco' derivado, se existir em enderecos_salvos
    const base = Array.isArray(user.enderecos_salvos) ? user.enderecos_salvos[0] : undefined;
    const endereco = normalizeAddressValue(base);
    setEditingUser({ ...user, endereco });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600 mt-2">
              Gerencie todos os usuários do sistema
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'ativo' || !u.status).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Novos este Mês</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {users.filter(u => {
                      const userDate = new Date(u.created_date);
                      const now = new Date();
                      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Tabs value={roleFilter} onValueChange={setRoleFilter}>
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="admin">Admins</TabsTrigger>
                    <TabsTrigger value="user">Usuários</TabsTrigger>
                  </TabsList>
                </Tabs>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  <option value="todos">Todos Status</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                  <option value="suspenso">Suspensos</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Conteúdo Principal */}
        {showForm ? (
          <UserForm
            user={editingUser}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="border-none shadow-lg animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Não há usuários que correspondem aos filtros selecionados
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={() => handleEdit(user)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { normalizeAddressValue } from "@/utils/entregadorAddress";
