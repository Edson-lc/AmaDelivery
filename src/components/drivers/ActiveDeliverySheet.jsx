import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Navigation, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ActiveDeliverySheet({ delivery, onClose }) {
  const [deliveryStage, setDeliveryStage] = useState('collecting'); // 'collecting' ou 'delivering'

  const isCollecting = deliveryStage === 'collecting';

  // Dados dinâmicos baseados na fase da entrega
  const currentTitle = isCollecting ? "Recolha" : "Entrega";
  const currentAddress = isCollecting ? delivery.endereco_coleta : delivery.endereco_entrega;
  const currentEntityName = isCollecting ? delivery.restaurante_nome : delivery.cliente_nome;
  const callNumber = isCollecting ? "+351229876543" : "+351912345678"; // Números simulados
  const buttonText = isCollecting ? "Confirmar Recolha" : "Confirmar Entrega";

  const handleNavigate = () => {
    const address = encodeURIComponent(currentAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${callNumber}`);
  };

  const handleNextStep = () => {
    if (isCollecting) {
      setDeliveryStage('delivering');
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full bg-white rounded-t-2xl shadow-2xl overflow-hidden"
    >
      {/* Header Verde */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">
              {currentEntityName}
            </h2>
            <Badge className="bg-white/20 text-white font-medium border-white/30">
              {currentTitle}
            </Badge>
          </div>
          
          <Button
            size="icon"
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={handleCall}
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 pt-4 pb-6 sm:px-6">
        {/* Endereço com botão de navegação */}
        <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{currentAddress}</p>
            </div>
            <Button 
                size="icon"
                className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0"
                onClick={handleNavigate}
            >
                <Navigation className="w-5 h-5" />
            </Button>
        </div>

        {/* Informações da Entrega */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500">Ganhos</p>
            <p className="font-bold text-lg text-green-600">€{delivery.valor_frete.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500">Pedido</p>
            <p className="font-bold text-lg text-gray-800">#{delivery.order_id.slice(-3)}</p>
          </div>
        </div>
        
        {/* Botão de Ação Principal */}
        <Button
            onClick={handleNextStep}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-base font-semibold rounded-xl"
        >
            <CheckCircle className="w-5 h-5 mr-2" />
            {buttonText}
        </Button>
        
        <div className="text-center mt-3">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Cancelar Entrega
          </button>
        </div>
      </div>
    </motion.div>
  );
}