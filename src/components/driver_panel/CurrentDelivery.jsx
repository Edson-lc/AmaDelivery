
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShoppingBag, Flag, Phone } from 'lucide-react';
import { Delivery } from '@/api/entities';
import { Order } from '@/api/entities';

const statusSteps = [
  { status: 'aceito', label: 'Ir para o restaurante', action: 'Coletado' },
  { status: 'coletado', label: 'Ir para o cliente', action: 'Entregue' },
];

export default function CurrentDelivery({ delivery, onUpdate }) {
  if (!delivery || !delivery.order_details) return null;

  const currentStep = statusSteps.find(step => step.status === delivery.status);
  const isFinalStep = statusSteps.findIndex(step => step.status === delivery.status) === statusSteps.length - 1;

  const handleUpdateStatus = async () => {
    try {
        if (isFinalStep) {
            // Último passo: Marcar entrega e pedido como concluídos
            await Delivery.update(delivery.id, { status: 'entregue' });
            await Order.update(delivery.order_id, { status: 'entregue' });
            // Notifica a página principal com o valor ganho para atualizar o total
            onUpdate(delivery.valor_frete);
        } else {
            // Avança para o próximo estado da entrega
            const nextStatusIndex = statusSteps.findIndex(step => step.status === delivery.status) + 1;
            const nextStatus = statusSteps[nextStatusIndex].status;
            await Delivery.update(delivery.id, { status: nextStatus });
            // Notifica a página principal para atualizar o estado, sem valor
            onUpdate();
        }
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        // Opcional: Mostrar uma mensagem de erro para o usuário
    }
  };
  
  const getAddress = () => {
    if(delivery.status === 'aceito'){
      return delivery.endereco_coleta; // Endereço do restaurante
    }
    if(delivery.status === 'coletado'){
        const address = delivery.order_details.endereco_entrega;
        if(typeof address === 'object'){
             return `${address.rua}, ${address.numero} - ${address.cidade}`;
        }
        return address; // Endereço do cliente
    }
    return "N/A";
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full"
      >
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>{currentStep?.label || 'Entrega em andamento'}</CardTitle>
            <CardDescription>Pedido # {delivery.order_id.slice(-6)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {delivery.status === 'aceito' ? 
                        <ShoppingBag className="w-5 h-5 text-orange-500 mt-1" /> :
                        <Flag className="w-5 h-5 text-blue-500 mt-1" />
                    }
                    <div>
                        <p className="text-sm text-gray-500">{delivery.status === 'aceito' ? 'Coletar em:' : 'Entregar em:'}</p>
                        <p className="font-semibold text-gray-800">{getAddress()}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray-700">Cliente: {delivery.order_details.cliente_nome}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="w-4 h-4"/>
                    </Button>
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleUpdateStatus}>
              {currentStep?.action || 'Concluir'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
