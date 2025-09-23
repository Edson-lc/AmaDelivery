
import React, { useState, useEffect, useCallback, useRef } from "react";
import { User, Entregador, Delivery } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Menu, HelpCircle, User as UserIcon, Clock, CreditCard, Settings, Store, Phone, LogOut, Check, CheckCircle, Euro, Route } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import DriverLocationMap from "../components/drivers/DriverLocationMap";
import NotificationModal from "../components/drivers/NotificationModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ActiveDeliverySheet is defined locally for this file's output, replacing any previous modal or sheet.

// NEW: ActiveDeliverySheet Component
// This component is defined here to provide a single functional file,
// and implements the sequential button flow for delivery actions.
function ActiveDeliverySheet({ delivery, onUpdateStatus, onFinalize }) { // Added onUpdateStatus, renamed onClose to onFinalize
    if (!delivery) return null;

    // Determine current stage based on delivery.status
    const currentStatus = delivery.status;

    // This function handles status updates and decides when to finalize the delivery flow.
    const handleAction = (newStatus, earningsChange = 0) => {
        onUpdateStatus(delivery.id, newStatus, earningsChange);
        // If the new status indicates completion or cancellation, finalize the delivery flow.
        if (newStatus === 'entregue' || newStatus === 'cancelado') {
            onFinalize();
        }
    };

    // Function to initiate a phone call
    const handleCall = (number) => {
        window.open(`tel:${number}`);
    };

    // Placeholder phone numbers - in a real application, these would come from the delivery object
    const restaurantPhone = "+351229876543"; // Placeholder
    const clientPhone = "+351912345678"; // Placeholder

    const handleConfirmPickup = () => handleAction('coletado'); // 'coletado' for picked up
    const handleConfirmDelivery = () => handleAction('entregue', delivery.valor_frete); // 'entregue' for delivered, pass earnings
    // The cancel delivery button is removed, so handleCancelDelivery is no longer needed here.

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <Card className="shadow-2xl rounded-t-2xl bg-white border-none">
                <CardContent className="p-6 pb-8">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-center">
                            <h3 className="text-xl font-bold text-green-600">Entrega Ativa</h3>
                            {/* Optional: Add a close button here if the onClose is intended to dismiss the card without action */}
                        </div>
                        <p className="text-sm text-gray-500 text-center -mt-2">
                            Detalhes da sua entrega actual.
                        </p>

                        {/* NEW: Stats Section */}
                        {/* Stats Section with reduced padding */}
                        <div className="grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-100 py-2">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-lg text-green-600">€{delivery.valor_frete.toFixed(2)}</span>
                                <span className="text-xs text-gray-500">Ganhos</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-lg">{delivery.tempo_estimado_min} min</span>
                                <span className="text-xs text-gray-500">Tempo</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-lg">{delivery.distancia_km.toFixed(1)} km</span>
                                <span className="text-xs text-gray-500">Distância</span>
                            </div>
                        </div>


                        <div className="space-y-3">
                            {/* Restaurant pickup details with call button */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Store className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Recolha em:</p>
                                        <p className="font-medium">{delivery.restaurante_nome}</p>
                                        <p className="text-xs text-gray-500">{delivery.endereco_coleta}</p> {/* Added pickup address */}
                                    </div>
                                </div>
                                {currentStatus === 'aceito' && (
                                    <Button size="icon" variant="outline" className="rounded-full flex-shrink-0" onClick={() => handleCall(restaurantPhone)}>
                                        <Phone className="w-4 h-4 text-gray-600" />
                                    </Button>
                                )}
                            </div>

                            {/* Client delivery details with call button */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-blue-600" /> {/* Using UserIcon as it's already aliased */}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Entregar a:</p>
                                        <p className="font-medium">{delivery.cliente_nome}</p>
                                        <p className="text-xs text-gray-500">{delivery.endereco_entrega}</p> {/* Added delivery address */}
                                    </div>
                                </div>
                                {currentStatus === 'coletado' && (
                                    <Button size="icon" variant="outline" className="rounded-full flex-shrink-0" onClick={() => handleCall(clientPhone)}>
                                        <Phone className="w-4 h-4 text-gray-600" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2 mt-4">
                            {currentStatus === 'aceito' && ( // Show pickup button only if accepted
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 text-base font-semibold">
                                            Confirmar Recolha
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-sm rounded-2xl p-0 border-none">
                                        <div className="p-6 text-center">
                                            <h3 className="text-xl font-semibold mb-2">Confirmar Recolha?</h3>
                                            <p className="text-gray-500 mb-6">
                                                Esta ação irá notificar o sistema que você já está com o pedido. Deseja continuar?
                                            </p>
                                            <div className="flex gap-4 w-full">
                                                <AlertDialogCancel asChild>
                                                     <Button variant="outline" className="w-full py-3 text-base">Cancelar</Button>
                                                </AlertDialogCancel>
                                                <AlertDialogAction asChild>
                                                    <Button onClick={handleConfirmPickup} className="w-full py-3 text-base">Sim, confirmar</Button>
                                                </AlertDialogAction>
                                            </div>
                                        </div>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            {currentStatus === 'coletado' && ( // Show delivery button only if picked up
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold">
                                            Confirmar Entrega
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-sm rounded-2xl p-0 border-none">
                                       <div className="p-6 text-center">
                                            <h3 className="text-xl font-semibold mb-2">Confirmar Entrega?</h3>
                                            <p className="text-gray-500 mb-6">
                                                Esta ação irá finalizar o pedido. O pagamento será processado. Deseja continuar?
                                            </p>
                                            <div className="flex gap-4 w-full">
                                                <AlertDialogCancel asChild>
                                                     <Button variant="outline" className="w-full py-3 text-base">Cancelar</Button>
                                                </AlertDialogCancel>
                                                <AlertDialogAction asChild>
                                                    <Button onClick={handleConfirmDelivery} className="w-full py-3 text-base">Sim, entreguei</Button>
                                                </AlertDialogAction>
                                            </div>
                                        </div>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function PainelEntregadorPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [driverProfile, setDriverProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false); // Renamed from isAvailable
    const [driverLocation, setDriverLocation] = useState([38.7223, -9.1393]); // Posição padrão: Lisboa
    const [earnings, setEarnings] = useState(0); // Ganhos do dia
    const [completedDeliveries, setCompletedDeliveries] = useState(0); // New state for completed deliveries

    const [pendingDelivery, setPendingDelivery] = useState(null);
    const [activeDelivery, setActiveDelivery] = useState(null); // Nova state para entrega ativa
    const [showNotificationModal, setShowNotificationModal] = useState(false); // New state for notification modal visibility

    const locationIntervalRef = useRef(null);
    const notificationIntervalRef = useRef(null);

    // CORREÇÃO: `updateLocation` agora só depende do `driverProfile`.
    const updateLocation = useCallback(() => {
        if (!navigator.geolocation || !driverProfile) return; // Adicionado guarda para `driverProfile`
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation([latitude, longitude]);
            // A atualização no DB acontece em segundo plano e não afeta o estado da UI
            Entregador.update(driverProfile.id, { latitude, longitude }).catch(e => console.error("Erro ao atualizar localização no DB:", e));
        }, () => {
            console.warn("Não foi possível obter a localização.");
        }, { enableHighAccuracy: true });
    }, [driverProfile]); // `driverProfile` como dependência para garantir que a função use o driver mais recente.

    // Simular chegada de novos pedidos
    const simulateNewDelivery = useCallback(() => {
        // CORREÇÃO: Ensure that only one notification is pending at a time
        // The check `!pendingDelivery` is already here, which correctly prevents
        // scheduling a new notification if one is already active.
        // Also ensure no new deliveries if there's an active one
        if (!isOnline || pendingDelivery || activeDelivery) return; // Use isOnline

        const mockDeliveries = [
            {
                id: `del_${Date.now()}_1`, // Ensure unique ID
                order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
                restaurante_nome: "Pizza da Casa",
                endereco_coleta: "Rua das Flores, 123, Porto",
                cliente_nome: "Maria Silva",
                endereco_entrega: "Av. da Liberdade, 456, Porto",
                valor_frete: 4.50 + Math.random() * 3,
                distancia_ate_restaurante_km: 1.8,
                distancia_restaurante_cliente_km: 2.5,
                distancia_km: 4.3,
                tempo_estimado_min: 15 + Math.floor(Math.random() * 15)
            },
            {
                id: `del_${Date.now()}_2`, // Ensure unique ID
                order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
                restaurante_nome: "Burger King",
                endereco_coleta: "Shopping Norte, Porto",
                cliente_nome: "João Santos",
                endereco_entrega: "Rua Nova, 789, Porto",
                valor_frete: 3.80 + Math.random() * 4,
                distancia_ate_restaurante_km: 1.2,
                distancia_restaurante_cliente_km: 1.9,
                distancia_km: 3.1,
                tempo_estimado_min: 12 + Math.floor(Math.random() * 18)
            },
            {
                id: `del_${Date.now()}_3`, // Ensure unique ID
                order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
                restaurante_nome: "Sushi Yamato",
                endereco_coleta: "Rua do Sushi, 45, Porto",
                cliente_nome: "Ana Costa",
                endereco_entrega: "Praça Central, 12, Porto",
                valor_frete: 5.20 + Math.random() * 2.5,
                distancia_ate_restaurante_km: 0.9,
                distancia_restaurante_cliente_km: 3.4,
                distancia_km: 4.3,
                tempo_estimado_min: 20 + Math.floor(Math.random() * 10)
            }
        ];

        const randomDelivery = mockDeliveries[Math.floor(Math.random() * mockDeliveries.length)];
        setPendingDelivery(randomDelivery);

        // Reproduzir som de notificação (se suportado)
        try {
            const audio = new Audio('data:audio/wav;base64,UGRpY2tlZCB1cCBmcm9tIFN0YWNrIE92ZXJmbG93IGFzIHdoYXQgdGhlIHVzZXIgaW50ZW5kZWQgaXMgYSBkYXRhIFVSSSBmb3IgdGhlIGF1ZGlvLiBJZiB0aGlzIG5vdCB0aGUgaW50ZW50aW9uLCB0aGUgYXVkaW8gZmlsZSBzaG91bGQgYmUgYSAuYXVkIOKCrCBPcmNoaWRlYSBodHRwczovL29yY2hpZGVhLm9yZy9hdWRpby9pZ25vcmUtaW9zLWludmFsaWQteGF1ZGlvY29udGV4dC8');
            audio.play().catch(() => {}); // Ignorar erros de audio
        } catch (error) {
            // Silenciosamente ignorar erros de áudio
        }
    }, [isOnline, pendingDelivery, activeDelivery]);

    // NEW: Function to check for active delivery
    const checkForActiveDelivery = useCallback(async (driverId) => {
        try {
            // UPDATED: Sort by most recent ('-created_date') and limit to 1
            const activeDeliveries = await Delivery.filter(
                { 
                    entregador_id: driverId, 
                    status: ['aceito', 'coletado'] 
                },
                '-created_date', // Sort by creation date descending
                1 // Limit to the single most recent result
            );
            
            if (activeDeliveries.length > 0) {
                const delivery = activeDeliveries[0];
                setActiveDelivery(delivery);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erro ao verificar entrega ativa:", error);
            return false;
        }
    }, []);


    useEffect(() => {
        const initializePage = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);

                if (user.tipo_usuario !== 'entregador') {
                    window.location.href = createPageUrl('PortalEntregador');
                    return;
                }

                const drivers = await Entregador.filter({ user_id: user.id });
                if (drivers.length === 0 || !drivers[0].aprovado) {
                    window.location.href = createPageUrl('PortalEntregador');
                    return;
                }

                const driver = drivers[0];
                setDriverProfile(driver);
                setIsOnline(driver.disponivel || false);
                setEarnings(driver.ganhos_hoje || 0); // Assuming Entregador entity has ganhos_hoje
                setCompletedDeliveries(driver.entregas_hoje || 0); // Assuming Entregador entity has entregas_hoje

                // NEW: Check for active delivery on page load
                await checkForActiveDelivery(driver.id);

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                window.location.href = createPageUrl('PortalEntregador');
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [checkForActiveDelivery]); // Dependency added for checkForActiveDelivery


    // CORREÇÃO: Separado em um `useEffect` que reage à mudança de `driverProfile`
    // para obter a localização inicial assim que o perfil é carregado.
    useEffect(() => {
        if (driverProfile) {
            updateLocation(); // Obter localização inicial assim que o driverProfile é carregado
        }
    }, [driverProfile, updateLocation]); // Reage quando o driverProfile é setado ou updateLocation muda (que só muda se driverProfile muda)


    useEffect(() => {
        if (isOnline) { // Use isOnline
            locationIntervalRef.current = setInterval(updateLocation, 30000); // Atualiza a cada 30 segundos
        } else {
            clearInterval(locationIntervalRef.current);
        }
        return () => clearInterval(locationIntervalRef.current);
    }, [isOnline, updateLocation]); // Use isOnline

    // Simular pedidos quando online
    useEffect(() => {
        // Only schedule a new notification if online, no delivery is pending, AND no delivery is active
        if (isOnline && !pendingDelivery && !activeDelivery) { // Use isOnline
            const randomInterval = 15000 + Math.random() * 30000; // Entre 15-45 segundos
            notificationIntervalRef.current = setTimeout(simulateNewDelivery, randomInterval);
        } else {
            // Clear any pending notification timer if offline, a notification is already pending, or a delivery is active
            clearTimeout(notificationIntervalRef.current);
        }

        return () => clearTimeout(notificationIntervalRef.current);
    }, [isOnline, pendingDelivery, activeDelivery, simulateNewDelivery]); // Use isOnline

    const handleAvailabilityToggle = async () => {
        if (!driverProfile) return; // Use driverProfile
        try {
            const newAvailability = !isOnline; // Use isOnline
            await Entregador.update(driverProfile.id, { disponivel: newAvailability }); // Use driverProfile
            setIsOnline(newAvailability); // Use setIsOnline
            if (!newAvailability) {
                setPendingDelivery(null); // Limpar notificações quando ficar offline
                setActiveDelivery(null); // Limpar entrega ativa
            }
        } catch (error) {
            console.error("Erro ao alterar disponibilidade:", error);
        }
    };

    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl("PortalEntregador");
    };

    const handleAcceptDelivery = async () => {
        if (!pendingDelivery || !driverProfile) return; // Use driverProfile

        try {
            const newDelivery = {
                ...pendingDelivery,
                entregador_id: driverProfile.id, // Use driverProfile
                created_date: new Date().toISOString(), // Adicionar data de criação
                status: 'aceito' // Set initial status to 'aceito' when accepted
            };

            // Save the delivery to the database
            const createdDelivery = await Delivery.create(newDelivery);

            // Set active delivery, using the created delivery data (which might have a DB ID)
            setActiveDelivery(createdDelivery || newDelivery);
            setPendingDelivery(null);
            // No earnings update here, as earnings are recorded upon successful delivery completion.
        } catch (error) {
            console.error("Erro ao aceitar entrega:", error);
        }
    };

    const handleRejectDelivery = useCallback(() => {
        setPendingDelivery(null);
        // The useEffect will handle scheduling the next notification automatically.
    }, []);

    // This function is passed to ActiveDeliverySheet to update delivery status and earnings.
    const handleUpdateDeliveryStatus = async (deliveryId, newStatus, earningsAmount = 0) => {
        try {
            await Delivery.update(deliveryId, { status: newStatus });

            // Update the local activeDelivery state
            setActiveDelivery(prevDelivery => {
                if (prevDelivery && prevDelivery.id === deliveryId) {
                    return { ...prevDelivery, status: newStatus };
                }
                return prevDelivery;
            });

            // If delivery is completed, update earnings and completed deliveries
            if (newStatus === 'entregue') {
                setEarnings(prev => prev + earningsAmount);
                setCompletedDeliveries(prev => prev + 1);
                // Optionally update driver profile in DB for persistent earnings/deliveries
                if (driverProfile) {
                    await Entregador.update(driverProfile.id, {
                        ganhos_hoje: (driverProfile.ganhos_hoje || 0) + earningsAmount,
                        entregas_hoje: (driverProfile.entregas_hoje || 0) + 1
                    });
                }
            }
        } catch (error) {
            console.error(`Erro ao atualizar status da entrega para ${newStatus}:`, error);
        }
    };

    const handleFinalizeActiveDelivery = () => {
        // This function is called when the delivery is definitively finished (delivered or cancelled)
        setActiveDelivery(null);
        // This will allow `simulateNewDelivery` to start looking for new orders again.
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }

    // Removed the error display block, as the outline implies redirection on error.

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(driverProfile?.nome_completo || 'D')}&background=f97316&color=fff&size=128`; // Use driverProfile

    return (
        <Sheet>
            <div className="relative h-screen w-screen overflow-hidden">
                {/* Header com menu e status */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                    <SheetTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-white hover:bg-gray-50">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    {/* Ganhos no Centro */}
                    <div className="bg-white rounded-full px-4 py-2 shadow-lg border">
                        <span className="text-lg font-bold text-gray-900">€{earnings.toFixed(2)}</span>
                    </div>

                    <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-white hover:bg-gray-50">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>

                <div className="absolute inset-0 z-0">
                    <DriverLocationMap position={driverLocation} />
                </div>

                {/* Conteúdo Inferior */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    {!isOnline && ( // Use isOnline
                        <Card className="shadow-2xl rounded-t-2xl bg-white border-none">
                            <CardContent className="p-6 pb-8 text-center">
                                <h3 className="text-xl font-bold mb-2">A entregar</h3>
                                <p className="text-gray-600 mb-4">Começa a fazer entregas agora e para quando quiseres.</p>
                                <Button
                                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 text-lg font-semibold"
                                    onClick={handleAvailabilityToggle}
                                >
                                    Começar já
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {isOnline && !activeDelivery && ( // Use isOnline
                        <div className="bg-green-500 text-white rounded-t-2xl px-6 py-4 shadow-2xl">
                            <div className="flex items-center justify-center gap-3">
                                <div className="relative flex h-3 w-3">
                                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></div>
                                    <div className="relative inline-flex rounded-full h-3 w-3 bg-white"></div>
                                </div>
                                <span className="text-lg font-semibold">
                                    A procurar pedidos...
                                </span>
                            </div>
                        </div>
                    )}

                    {isOnline && activeDelivery && ( // Use isOnline
                        <ActiveDeliverySheet
                            delivery={activeDelivery}
                            onUpdateStatus={handleUpdateDeliveryStatus}
                            onFinalize={handleFinalizeActiveDelivery}
                        />
                    )}
                </div>

                 {/* Menu Lateral Simplificado */}
                <SheetContent side="left" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                        {/* Header do Menu */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <img
                                    src={driverProfile?.foto_url || defaultAvatar} // Use driverProfile
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{driverProfile?.nome_completo}</h3> {/* Use driverProfile */}
                                    <p className="text-white/80 text-sm truncate">{driverProfile?.email}</p> {/* Use driverProfile */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div> {/* Use isOnline */}
                                        <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span> {/* Use isOnline */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navegação Principal - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            <nav className="p-4 space-y-6">
                                {/* Seção: Entregas e Pagamentos */}
                                <div className="space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 text-left hover:bg-gray-50"
                                        onClick={() => window.location.href = createPageUrl('EntregasRecentes')}
                                    >
                                        <Clock className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Entregas recentes</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 text-left hover:bg-gray-50"
                                    >
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Pagamentos</span>
                                    </Button>
                                </div>

                                {/* Linha Separadora */}
                                <div className="border-t border-gray-200"></div>

                                {/* Seção: Perfil e Configurações */}
                                <div className="space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 text-left hover:bg-gray-50"
                                        onClick={() => window.location.href = createPageUrl('PerfilEntregador')}
                                    >
                                        <UserIcon className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Meu Perfil</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 text-left hover:bg-gray-50"
                                        onClick={() => window.location.href = createPageUrl('DefinicoesEntregador')}
                                    >
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Definições e privacidade</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 text-left hover:bg-gray-50"
                                    >
                                        <HelpCircle className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Ajuda e Suporte</span>
                                    </Button>
                                </div>
                            </nav>
                        </div>

                        {/* Footer do Menu */}
                        <div className="border-t bg-gray-50">
                            {/* Toggle de Disponibilidade */}
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Disponível para entregas</p>
                                        <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p> {/* Use isOnline */}
                                    </div>
                                    <Switch
                                        checked={isOnline} // Use isOnline
                                        onCheckedChange={handleAvailabilityToggle}
                                    />
                                </div>
                            </div>
                            {/* No more separator or logout button here, as per new layout */}
                        </div>
                    </div>
                </SheetContent>

                {/* Modal de Notificação */}
                <NotificationModal
                    delivery={pendingDelivery}
                    onAccept={handleAcceptDelivery}
                    onReject={handleRejectDelivery}
                    onClose={() => setPendingDelivery(null)}
                />

            </div>
        </Sheet>
    );
}
