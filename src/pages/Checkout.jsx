
import React, { useState, useEffect, useCallback } from "react";
import { Cart, Restaurant, Order, Customer, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Phone, 
  User as UserIcon, // Renamed to avoid conflict with User entity
  ShoppingBag,
  Clock,
  CheckCircle,
  Loader2 // Added for loading indicator
} from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [customerData, setCustomerData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "Lisboa",
      cep: "",
      referencia: ""
    },
    observacoes: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cartao_credito");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('restaurant');
  const cartId = urlParams.get('cart');

  // Callback to load cart and restaurant data
  const loadCheckoutData = useCallback(async () => {
    if (!restaurantId && !cartId) {
      alert("Dados do carrinho não encontrados. Redirecionando para a página inicial.");
      window.location.href = createPageUrl("Home");
      return;
    }
    
    try {
      let fetchedCartData = null;
      
      if (cartId) {
        fetchedCartData = await Cart.get(cartId);
      } else if (restaurantId) {
        const sessionId = localStorage.getItem('delivery_session_id');
        const carts = await Cart.filter({ session_id: sessionId, restaurant_id: restaurantId });
        fetchedCartData = carts.length > 0 ? carts[0] : null;
      }

      if (!fetchedCartData || !fetchedCartData.itens || fetchedCartData.itens.length === 0) {
        alert("Seu carrinho está vazio. Redirecionando para a página inicial.");
        window.location.href = createPageUrl("Home");
        return;
      }

      const fetchedRestaurantData = await Restaurant.get(fetchedCartData.restaurant_id);
      
      setCart(fetchedCartData);
      setRestaurant(fetchedRestaurantData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados do checkout. Tente novamente ou volte para a página inicial.");
      window.location.href = createPageUrl("Home");
    }
  }, [restaurantId, cartId]);

  // Main useEffect for authentication and initial data loading
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      setIsLoading(true); // Start loading state
      try {
        const userData = await User.me(); // Attempt to get current user data
        
        // Update customerData with logged-in user's info if available
        setCustomerData(prev => ({
          ...prev,
          nome: userData.full_name || prev.nome,
          email: userData.email || prev.email,
          telefone: userData.telefone || prev.telefone,
        }));

        await loadCheckoutData(); // Load cart and restaurant data AFTER user is authenticated
      } catch (error) {
        // Se não estiver logado, redireciona para a página de login da plataforma,
        // com instrução para voltar para o checkout após o sucesso.
        console.error("Usuário não autenticado, redirecionando para login:", error);
        await User.loginWithRedirect(window.location.href);
      } finally {
        const isRedirectingBackFromLogin = window.location.href.includes('token=');
        if (!isRedirectingBackFromLogin) {
          setIsLoading(false); // End loading state once all checks and loads are done
        }
      }
    };

    checkAuthAndLoad();
  }, [loadCheckoutData]);

  // Helper function to calculate total for a single item
  const calculateItemTotal = (item) => {
    let total = item.preco_unitario * item.quantidade;
    
    if (item.adicionais_selecionados && item.adicionais_selecionados.length > 0) {
      const adicionaisTotal = item.adicionais_selecionados.reduce((sum, add) => sum + (add.preco || 0), 0);
      total += adicionaisTotal * item.quantidade;
    }

    return total;
  };

  const calculateTotal = () => {
    if (!cart || !restaurant || !cart.itens) return 0;
    
    // Calculate subtotal by summing up calculateItemTotal for all items
    const subtotal = cart.itens.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const taxaEntrega = restaurant.taxa_entrega || 0;
    const taxaServico = subtotal * 0.02; // 2% taxa de serviço
    
    return subtotal + taxaEntrega + taxaServico;
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomerData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const processOrder = async () => {
    setIsProcessing(true);

    try {
      // 1. Criar ou atualizar cliente
      let customer;
      const existingCustomers = await Customer.filter({ telefone: customerData.telefone });
      
      if (existingCustomers.length > 0) {
        customer = existingCustomers[0];
        await Customer.update(customer.id, {
          nome: customerData.nome,
          email: customerData.email,
          endereco_principal: `${customerData.endereco.rua}, ${customerData.endereco.numero}`,
          data_ultimo_pedido: new Date().toISOString()
        });
      } else {
        customer = await Customer.create({
          nome: customerData.nome,
          telefone: customerData.telefone,
          email: customerData.email,
          endereco_principal: `${customerData.endereco.rua}, ${customerData.endereco.numero}`,
          total_pedidos: 1,
          valor_gasto_total: calculateTotal(),
          data_ultimo_pedido: new Date().toISOString()
        });
      }

      // 2. Criar pedido
      const numeroWer = `#${Date.now().toString().slice(-8)}`; // Simplified order number generation
      
      // Calculate subtotal from item totals for the order object
      const orderSubtotal = cart.itens.reduce((sum, item) => sum + calculateItemTotal(item), 0);

      const orderData = {
        customer_id: customer.id,
        restaurant_id: cart.restaurant_id, // Use restaurant_id from cart
        numero_pedido: numeroWer,
        cliente_nome: customerData.nome,
        cliente_telefone: customerData.telefone,
        cliente_email: customerData.email,
        endereco_entrega: customerData.endereco,
        itens: cart.itens.map(item => ({
          item_id: item.item_id, // Add item_id
          nome: item.nome,
          preco_unitario: item.preco_unitario, // Add preco_unitario
          quantidade: item.quantidade,
          observacoes: item.observacoes,
          adicionais_selecionados: item.adicionais_selecionados || [], // Use adicionais_selecionados
          personalizacoes: item.personalizacoes || {}, // Add personalizacoes
          ingredientes_removidos: item.ingredientes_removidos || [], // Add ingredientes_removidos
          subtotal: calculateItemTotal(item) // Calculate subtotal for each item
        })),
        subtotal: orderSubtotal,
        taxa_entrega: restaurant.taxa_entrega || 0,
        taxa_servico: orderSubtotal * 0.02, // Calculate service fee based on actual subtotal
        total: calculateTotal(),
        forma_pagamento: paymentMethod,
        observacoes_cliente: customerData.observacoes,
        status: "confirmado", // Directly set status to "confirmado"
        tempo_estimado_preparo: restaurant.tempo_preparo || 30,
        tempo_estimado_entrega: (restaurant.tempo_preparo || 30) + 30
      };

      const newOrder = await Order.create(orderData);
      
      // 3. Limpar carrinho
      await Cart.update(cart.id, { itens: [], subtotal: 0 }); // Subtotal can be reset or updated based on new cart items

      setOrderId(numeroWer);
      setOrderComplete(true);
      
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    }
    
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="ml-4 text-gray-600">Verificando sua sessão...</p>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pedido Confirmado!
            </h2>
            
            <p className="text-gray-600 mb-4">
              Seu pedido {orderId} foi confirmado e está sendo preparado.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>Tempo estimado: {(restaurant?.tempo_preparo || 30) + 30} minutos</span>
              </div>
              <p className="text-xs text-gray-500">
                Você receberá atualizações no número {customerData.telefone}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = createPageUrl("Home")}
                className="w-full"
              >
                Fazer Novo Pedido
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || !restaurant || !cart.itens || cart.itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Adicione itens ao seu carrinho para continuar.</p>
          <Button onClick={() => window.location.href = createPageUrl("Home")}>
            Ver Restaurantes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = createPageUrl(`RestaurantMenu?id=${restaurant.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Menu
            </Button>
            <h1 className="text-xl font-bold">Finalizar Pedido</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" /> {/* Using UserIcon */}
                  Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={customerData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input
                      value={customerData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(91) 99999-9999"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label>Rua *</Label>
                    <Input
                      value={customerData.endereco.rua}
                      onChange={(e) => handleInputChange('endereco.rua', e.target.value)}
                      placeholder="Nome da rua"
                      required
                    />
                  </div>
                  <div>
                    <Label>Número *</Label>
                    <Input
                      value={customerData.endereco.numero}
                      onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={customerData.endereco.complemento}
                      onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                      placeholder="Apt, Bloco, etc."
                    />
                  </div>
                  <div>
                    <Label>Bairro *</Label>
                    <Input
                      value={customerData.endereco.bairro}
                      onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                      placeholder="Bairro"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cartao_credito" id="cartao_credito" />
                    <Label htmlFor="cartao_credito" className="flex-1 cursor-pointer">
                      Cartão de Crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro" className="flex-1 cursor-pointer">
                      Dinheiro (Pagar na entrega)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customerData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Alguma observação especial? (Portão azul, interfone quebrado, etc.)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <p className="text-sm text-gray-600">{restaurant?.nome}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Itens detalhados */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {cart.itens.map((item, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{item.quantidade}x {item.nome}</span>
                        <span className="font-semibold">€{calculateItemTotal(item).toFixed(2)}</span>
                      </div>
                      
                      {/* Personalizações */}
                      {item.personalizacoes && Object.keys(item.personalizacoes).length > 0 && (
                        <div className="text-xs text-gray-600 ml-4">
                          {Object.entries(item.personalizacoes).map(([grupo, opcao]) => (
                            <div key={grupo}>• {grupo}: {opcao}</div>
                          ))}
                        </div>
                      )}
                      
                      {/* Adicionais */}
                      {item.adicionais_selecionados && item.adicionais_selecionados.length > 0 && (
                        <div className="text-xs text-gray-600 ml-4">
                          {item.adicionais_selecionados.map((add, idx) => (
                            <div key={idx}>+ {add.nome} (€{add.preco.toFixed(2)})</div>
                          ))}
                        </div>
                      )}
                      
                      {/* Ingredientes removidos */}
                      {item.ingredientes_removidos && item.ingredientes_removidos.length > 0 && (
                        <div className="text-xs text-red-600 ml-4">
                          Sem: {item.ingredientes_removidos.join(", ")}
                        </div>
                      )}
                       {item.observacoes && (
                          <p className="text-xs text-gray-500 ml-4">Obs: {item.observacoes}</p>
                        )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>€{cart.itens.reduce((sum, item) => sum + calculateItemTotal(item), 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Taxa de Entrega</span>
                    <span>€{(restaurant?.taxa_entrega || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Taxa de Serviço (2%)</span>
                    <span>€{(cart.itens.reduce((sum, item) => sum + calculateItemTotal(item), 0) * 0.02).toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 text-center">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Tempo estimado: {(restaurant?.tempo_preparo || 30) + 30} min
                </div>

                <Button
                  onClick={processOrder}
                  disabled={isProcessing || !customerData.nome || !customerData.telefone || !customerData.endereco.rua || !customerData.endereco.numero || !customerData.endereco.bairro}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  {isProcessing ? "Processando..." : `Confirmar Pedido • €${calculateTotal().toFixed(2)}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao confirmar, você concorda com nossos termos de uso e política de privacidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
