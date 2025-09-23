import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock, CheckCircle, Truck, XCircle, User, MapPin, Phone, Hash, CreditCard, Utensils
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
    pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800", icon: Clock },
    pronto: { label: "Pronto", color: "bg-purple-100 text-purple-800", icon: CheckCircle },
    saiu_entrega: { label: "Em Rota", color: "bg-indigo-100 text-indigo-800", icon: Truck },
    entregue: { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
};

const nextStatusOptions = {
    pendente: [{ status: 'confirmado', label: 'Confirmar Pedido' }],
    confirmado: [{ status: 'preparando', label: 'Iniciar Preparo' }],
    preparando: [{ status: 'pronto', label: 'Marcar como Pronto' }],
    pronto: [{ status: 'saiu_entrega', label: 'Marcar como Saiu para Entrega' }],
    saiu_entrega: [{ status: 'entregue', label: 'Finalizar Entrega' }],
};


export default function OrderDetailsModal({ order, restaurant, onClose, onUpdateStatus }) {
    
    // Helper function to format address
    const formatAddress = (endereco) => {
        if (typeof endereco === 'string') return endereco;
        if (!endereco || typeof endereco !== 'object') return 'Endereço não informado';

        const { rua = '', numero = '', bairro = '', cidade = '' } = endereco;
        let addressString = '';
        if (rua) addressString += rua;
        if (numero) addressString += `, ${numero}`;
        if (bairro) addressString += ` - ${bairro}`;
        if (cidade && bairro !== cidade) addressString += `, ${cidade}`;

        return addressString || 'Endereço não informado';
    };

    const InfoLine = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3 text-sm">
            <Icon className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-gray-600">{value}</p>
            </div>
        </div>
    );
    
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Detalhes do Pedido #{order.id.slice(-6)}</span>
                        <Badge className={`${statusConfig[order.status]?.color || ''} border font-medium`}>
                            {statusConfig[order.status]?.label || order.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {format(new Date(order.created_date), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 py-4">
                    {/* Coluna Esquerda */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Cliente</h3>
                        <InfoLine icon={User} label="Nome" value={order.cliente_nome} />
                        <InfoLine icon={Phone} label="Telefone" value={order.cliente_telefone} />
                        <InfoLine icon={MapPin} label="Endereço de Entrega" value={formatAddress(order.endereco_entrega)} />
                    </div>

                    {/* Coluna Direita */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Restaurante</h3>
                        <InfoLine icon={Utensils} label="Nome" value={restaurant?.nome || 'Não informado'} />
                        <InfoLine icon={MapPin} label="Endereço de Coleta" value={restaurant?.endereco || 'Não informado'} />
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Itens</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {order.itens.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                <div>
                                    <p className="font-medium">{item.quantidade}x {item.nome}</p>
                                    {item.observacoes && <p className="text-xs text-gray-500">Obs: {item.observacoes}</p>}
                                </div>
                                <p className="font-semibold">€{(item.subtotal || item.preco_unitario * item.quantidade).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="border-t pt-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span className="font-medium">€{order.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Taxa de Entrega:</span> <span className="font-medium">€{order.taxa_entrega?.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-base"><span className="text-gray-800">Total:</span> <span>€{order.total?.toFixed(2)}</span></div>
                </div>
                
                {/* Ações */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-lg mb-3">Ações</h3>
                     <div className="flex gap-2">
                        {(nextStatusOptions[order.status] || []).map(option => (
                             <Button key={option.status} onClick={() => onUpdateStatus(order.id, option.status)}>
                                {option.label}
                            </Button>
                        ))}
                         <Button variant="destructive" onClick={() => onUpdateStatus(order.id, 'cancelado')}>
                            Cancelar Pedido
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}