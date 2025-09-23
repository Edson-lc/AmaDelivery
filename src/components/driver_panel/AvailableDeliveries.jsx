import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, ArrowRight } from 'lucide-react';

export default function AvailableDeliveries({ deliveries, onAccept }) {
  if (!deliveries || deliveries.length === 0) {
    return null;
  }

  const delivery = deliveries[0]; // Mostrar apenas a primeira entrega disponível

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
            <CardTitle>Novo Pedido Disponível!</CardTitle>
            <CardDescription># {delivery.order_id.slice(-6)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Distância Total</span>
                <span className="font-medium">{delivery.distancia_km?.toFixed(1) || 'N/A'} km</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tempo Estimado</span>
                <span className="font-medium">{delivery.tempo_estimado_min || 'N/A'} min</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-green-600">
                <span>Ganhos</span>
                <span>€ {delivery.valor_frete?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => onAccept(delivery)}>
              Aceitar Corrida <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}