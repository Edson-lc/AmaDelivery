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
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  inativo: "bg-gray-100 text-gray-800 border-gray-200",
  suspenso: "bg-red-100 text-red-800 border-red-200",
};

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

export default function EntregadorDetails({
  entregador,
  solicitacaoAlteracao,
  onBack,
  onApprove,
  onReject,
  extraActions,
  onEdit,
}) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    entregador.nome_completo || "E"
  )}&background=f97316&color=fff`;
  const isPendente = !entregador.aprovado;
  const hasAlteracao = !!solicitacaoAlteracao;

  const dadosAtuais = entregador || {};
  const normalizeEndereco = (raw) => {
    if (raw === null || raw === undefined) return null;
    if (Array.isArray(raw)) return raw[0] || null;
    if (typeof raw === "string") return { rua: raw };
    if (typeof raw === "object") return raw;
    return null;
  };
  const atualEndereco = normalizeEndereco((entregador || {}).endereco);
  const novosEndereco = normalizeEndereco((solicitacaoAlteracao?.dados_novos || {}).endereco);
  const dadosNovos = solicitacaoAlteracao?.dados_novos || {};
  const hasPhotoChange =
    hasAlteracao && dadosNovos.foto_url && dadosNovos.foto_url !== dadosAtuais.foto_url;

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-xl">
                {hasAlteracao ? "Solicitação de Alteração" : "Detalhes do Entregador"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {hasAlteracao
                  ? "Compare os dados atuais com as alterações solicitadas"
                  : "Visualize todas as informações do perfil"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAlteracao && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" /> Alteraçao Pendente
              </Badge>
            )}
            {extraActions}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna da Foto e informações B?sicas */}
          <div className="lg:col-span-1">
            {hasPhotoChange ? (
              <div className="mb-6">
                <h3 className="text-center font-semibold mb-2">Alteraçao de Foto</h3>
                <div className="flex justify-center items-center gap-4">
                  <div>
                    <p className="text-xs text-center mb-1 text-red-600">Atual</p>
                    <img
                      src={dadosAtuais.foto_url || defaultAvatar}
                      alt="Foto Atual"
                      className="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-center mb-1 text-green-600">Nova</p>
                    <img
                      src={dadosNovos.foto_url || defaultAvatar}
                      alt="Nova Foto"
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center mb-6">
                <img
                  src={dadosAtuais.foto_url || defaultAvatar}
                  alt={dadosAtuais.nome_completo}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 shadow-lg mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
            )}

            <div className="text-center space-y-1">
              <h2 className="font-semibold text-gray-900">
                {dadosAtuais.nome_completo || "Nome Não informado"}
              </h2>
              <p className="text-sm text-gray-600">{dadosAtuais.email}</p>
            </div>

            <div className="mt-4 space-y-2">
              {dadosAtuais.aprovado ? (
                <div className="text-xs text-green-800 bg-green-100 border border-green-200 rounded px-3 py-1 text-center">
                  Aprovado
                </div>
              ) : (
                <div className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-200 rounded px-3 py-1 text-center">
                  Pendente
                </div>
              )}
              {dadosAtuais.status && (
                <div className="text-xs text-gray-800 bg-gray-100 border border-gray-200 rounded px-3 py-1 text-center">
                  Status: {dadosAtuais.status}
                </div>
              )}
            </div>
          </div>

          {/* Colunas de Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* informações Pessoais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" /> Informações Pessoais
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
                    <span>
                      {dadosAtuais.created_date
                        ? format(new Date(dadosAtuais.created_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })
                        : "Não informado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Endere?o */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" /> Endereço
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange label="Rua" oldValue={atualEndereco?.rua} newValue={novosEndereco?.rua} />
                <FieldWithChange label="Número" oldValue={atualEndereco?.numero} newValue={novosEndereco?.numero} />
                <FieldWithChange label="Bairro" oldValue={atualEndereco?.bairro} newValue={novosEndereco?.bairro} />
                <FieldWithChange label="Cidade" oldValue={atualEndereco?.cidade} newValue={novosEndereco?.cidade} />
                <FieldWithChange label="Código Postal" oldValue={atualEndereco?.cep} newValue={novosEndereco?.cep} />
              </div>
            </div>

            <Separator />

            {/* Vei­culo */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" /> Veículo
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange label="Tipo de Veículo" oldValue={dadosAtuais.veiculo_tipo} newValue={dadosNovos.veiculo_tipo} />
                <FieldWithChange label="Placa" oldValue={dadosAtuais.veiculo_placa} newValue={dadosNovos.veiculo_placa} />
              </div>
            </div>

            <Separator />

            {/* Dados Bancários */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" /> Dados Bancários
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FieldWithChange label="Banco" oldValue={dadosAtuais.nome_banco} newValue={dadosNovos.nome_banco} />
                <FieldWithChange label="IBAN" oldValue={dadosAtuais.iban} newValue={dadosNovos.iban} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-8 pt-6 border-t border-gray-100">
          {(isPendente || hasAlteracao) && (
            <div className="flex gap-4">
              <Button
                className="bg-green-500 hover:bg-green-600 px-8"
                onClick={() => onApprove(hasAlteracao ? solicitacaoAlteracao : entregador.id)}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {hasAlteracao ? "Aprovar Alteraçao" : "Aprovar"}
              </Button>
              <Button
                variant="destructive"
                className="px-8"
                onClick={() => onReject(hasAlteracao ? solicitacaoAlteracao : entregador.id)}
              >
                <UserX className="w-4 h-4 mr-2" />
                {hasAlteracao ? "Rejeitar Alteraçao" : "Rejeitar"}
              </Button>
            </div>
          )}
          {onEdit && (
            <Button
              onClick={onEdit}
              className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Editar Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


