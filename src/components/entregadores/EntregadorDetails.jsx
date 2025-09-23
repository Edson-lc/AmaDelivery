
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Truck,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react";
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

// Componente para mostrar valor com alteração pendente
const FieldWithChange = ({ label, oldValue, newValue, icon: Icon }) => {
  const hasChange = newValue !== undefined && oldValue !== newValue;
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {hasChange && <AlertTriangle className="w-3 h-3 text-orange-500" />}
      </label>
      
      {hasChange ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600 line-through text-sm">
            <span className="font-medium">Atual:</span>
            <span>{oldValue || "Não informado"}</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <span className="text-sm">Novo:</span>
            <span>{newValue}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>{oldValue || "Não informado"}</span>
        </div>
      )}
    </div>
  );
};

export default function EntregadorDetails({ entregador, solicitacaoAlteracao, onBack, onApprove, onReject }) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(entregador.nome_completo || 'E')}&background=f97316&color=fff`;
  const isPendente = !entregador.aprovado;
  const hasAlteracao = !!solicitacaoAlteracao;
  
  // Dados atuais vs novos dados
  const dadosAtuais = entregador;
  const dadosNovos = solicitacaoAlteracao?.dados_novos || {};

  const hasPhotoChange = hasAlteracao && dadosNovos.foto_url && dadosNovos.foto_url !== dadosAtuais.foto_url;

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {hasAlteracao ? 'Solicitação de Alteração' : 'Detalhes do Entregador'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {hasAlteracao ? 'Compare os dados atuais com as alterações solicitadas' : 'Visualize todas as informações do perfil'}
            </p>
          </div>
          
          {hasAlteracao && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Alteração Pendente
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna da Foto e Informações Básicas */}
          <div className="lg:col-span-1">
            {hasPhotoChange ? (
                <div className="mb-6">
                    <h3 className="text-center font-semibold mb-2">Alteração de Foto</h3>
                    <div className="flex justify-center items-center gap-4">
                        <div>
                            <p className="text-xs text-center mb-1 text-red-600">Atual</p>
                            <img
                                src={dadosAtuais.foto_url || defaultAvatar}
                                alt="Foto Atual"
                                className="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow-lg"
                                onError={(e) => { e.target.src = defaultAvatar; }}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-center mb-1 text-green-600">Nova</p>
                            <img
                                src={dadosNovos.foto_url || defaultAvatar}
                                alt="Nova Foto"
                                className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
                                onError={(e) => { e.target.src = defaultAvatar; }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center mb-6">
                    <img
                        src={entregador.foto_url || defaultAvatar}
                        alt={entregador.nome_completo}
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-orange-200 shadow-lg"
                        onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                </div>
            )}
            
            <h2 className="text-xl font-bold mt-4 text-gray-900 text-center">
              {entregador.nome_completo || "Nome não informado"}
            </h2>
            <p className="text-gray-600 text-center">{entregador.email}</p>

            <div className="space-y-2 mt-4">
              {entregador.aprovado ? (
                <Badge className="w-full justify-center bg-green-100 text-green-800 border-green-200 font-medium">
                  ✅ Aprovado
                </Badge>
              ) : (
                <Badge className="w-full justify-center bg-yellow-100 text-yellow-800 border-yellow-200 font-medium">
                  ⏳ Pendente de Aprovação
                </Badge>
              )}
              
              {entregador.status && (
                <Badge className={`w-full justify-center ${statusColors[entregador.status]} border font-medium`}>
                  Status: {entregador.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Colunas de Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Informações Pessoais
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange 
                  label="Nome Completo"
                  oldValue={dadosAtuais.nome_completo}
                  newValue={dadosNovos.nome_completo}
                  icon={User}
                />
                
                <FieldWithChange 
                  label="Email"
                  oldValue={dadosAtuais.email}
                  newValue={dadosNovos.email}
                  icon={Mail}
                />
                
                <FieldWithChange 
                  label="Telefone"
                  oldValue={dadosAtuais.telefone}
                  newValue={dadosNovos.telefone}
                  icon={Phone}
                />
                
                <FieldWithChange 
                  label="NIF"
                  oldValue={dadosAtuais.nif}
                  newValue={dadosNovos.nif}
                  icon={FileText}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{dadosAtuais.created_date ? format(new Date(dadosAtuais.created_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : "Não informado"}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Endereço
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <FieldWithChange 
                  label="Rua"
                  oldValue={dadosAtuais.endereco?.rua}
                  newValue={dadosNovos.endereco?.rua}
                />
                 <FieldWithChange 
                  label="Número"
                  oldValue={dadosAtuais.endereco?.numero}
                  newValue={dadosNovos.endereco?.numero}
                />
                 <FieldWithChange 
                  label="Bairro"
                  oldValue={dadosAtuais.endereco?.bairro}
                  newValue={dadosNovos.endereco?.bairro}
                />
                 <FieldWithChange 
                  label="Cidade"
                  oldValue={dadosAtuais.endereco?.cidade}
                  newValue={dadosNovos.endereco?.cidade}
                />
                 <FieldWithChange 
                  label="Código Postal"
                  oldValue={dadosAtuais.endereco?.cep}
                  newValue={dadosNovos.endereco?.cep}
                />
              </div>
            </div>


            <Separator />

            {/* Informações do Veículo */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Veículo
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange 
                  label="Tipo de Veículo"
                  oldValue={dadosAtuais.veiculo_tipo}
                  newValue={dadosNovos.veiculo_tipo}
                />
                
                <FieldWithChange 
                  label="Placa"
                  oldValue={dadosAtuais.veiculo_placa}
                  newValue={dadosNovos.veiculo_placa}
                />
              </div>
            </div>

            <Separator />

            {/* Informações Bancárias */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Dados Bancários
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange 
                  label="Banco"
                  oldValue={dadosAtuais.nome_banco}
                  newValue={dadosNovos.nome_banco}
                />
                
                <FieldWithChange 
                  label="IBAN"
                  oldValue={dadosAtuais.iban}
                  newValue={dadosNovos.iban}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {(isPendente || hasAlteracao) && (
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <Button 
              className="bg-green-500 hover:bg-green-600 px-8" 
              onClick={() => onApprove(hasAlteracao ? solicitacaoAlteracao : entregador.id)}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {hasAlteracao ? 'Aprovar Alteração' : 'Aprovar'}
            </Button>
            <Button 
              variant="destructive"
              className="px-8" 
              onClick={() => onReject(hasAlteracao ? solicitacaoAlteracao : entregador.id)}
            >
              <UserX className="w-4 h-4 mr-2" />
              {hasAlteracao ? 'Rejeitar Alteração' : 'Rejeitar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}