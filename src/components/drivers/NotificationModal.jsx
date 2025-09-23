
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, CheckCircle, XCircle, Route, Bike, Milestone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationModal({ delivery, onAccept, onReject, onClose }) {
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos para responder

  useEffect(() => {
    if (!delivery) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReject(); // Auto-rejeita se o tempo acabar
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [delivery, onReject]);

  if (!delivery) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl bg-white">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Nova Entrega Disponível!</CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono">{timeLeft}s</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* Valor da Entrega */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-1">
                  €{delivery.valor_frete.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Ganho estimado</p>
              </div>

              {/* Distâncias - Layout inspirado na imagem */}
              <div className="flex bg-gray-50 p-3 rounded-lg border">
                <div className="flex-1 text-center border-r border-gray-200">
                  <p className="text-xs font-semibold uppercase text-orange-600 tracking-wider">Recolha</p>
                  <p className="text-xl font-bold text-gray-900">{delivery.distancia_ate_restaurante_km.toFixed(1)} km</p>
                </div>
                <div className="flex-1 text-center border-r border-gray-200">
                  <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Entrega</p>
                  <p className="text-xl font-bold text-gray-900">{delivery.distancia_restaurante_cliente_km.toFixed(1)} km</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold uppercase text-purple-600 tracking-wider">Total</p>
                  <p className="text-xl font-bold text-gray-900">{delivery.distancia_km.toFixed(1)} km</p>
                </div>
              </div>


              {/* Detalhes da Entrega */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{delivery.restaurante_nome}</p>
                    <p className="text-sm text-gray-500">{delivery.endereco_coleta}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{delivery.cliente_nome}</p>
                    <p className="text-sm text-gray-500">{delivery.endereco_entrega}</p>
                  </div>
                </div>
              </div>

              {/* Tempo Estimado */}
              <div className="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Tempo estimado: {delivery.tempo_estimado_min} minutos
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onReject}
                  className="flex-1 h-12 text-base font-semibold border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Recusar
                </Button>
                <Button 
                  onClick={onAccept}
                  className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aceitar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
