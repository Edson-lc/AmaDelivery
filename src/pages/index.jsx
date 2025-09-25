import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Restaurantes from "./Restaurantes";

import Profile from "./Profile";

import Usuarios from "./Usuarios";

import Relatorios from "./Relatorios";

import Pedidos from "./Pedidos";

import Home from "./Home";

import RestaurantMenu from "./RestaurantMenu";

import Checkout from "./Checkout";

import Menu from "./Menu";

import MinhaConta from "./MinhaConta";

import PortalEntregador from "./PortalEntregador";

import CadastroEntregador from "./CadastroEntregador";

import Entregadores from "./Entregadores";
import EntregadorDetalhes from "./EntregadorDetalhes";

import PainelEntregador from "./PainelEntregador";

import PerfilEntregador from "./PerfilEntregador";

import DefinicoesEntregador from "./DefinicoesEntregador";

import EntregasRecentes from "./EntregasRecentes";

import RestaurantDashboard from "./RestaurantDashboard";

import DatabaseScripts from "./DatabaseScripts";
import Login from "./Login";
import CriarConta from "./CriarConta";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { appBasePath } from '@/utils';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Restaurantes: Restaurantes,
    
    Profile: Profile,
    
    Usuarios: Usuarios,
    
    Relatorios: Relatorios,
    
    Pedidos: Pedidos,
    
    Home: Home,
    
    RestaurantMenu: RestaurantMenu,
    
    Checkout: Checkout,
    
    Menu: Menu,
    
    MinhaConta: MinhaConta,
    
    PortalEntregador: PortalEntregador,
    
    CadastroEntregador: CadastroEntregador,
    
    Entregadores: Entregadores,
    
    PainelEntregador: PainelEntregador,
    
    PerfilEntregador: PerfilEntregador,
    
    DefinicoesEntregador: DefinicoesEntregador,
    
    EntregasRecentes: EntregasRecentes,
    
    RestaurantDashboard: RestaurantDashboard,
    
    DatabaseScripts: DatabaseScripts,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'Home';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Restaurantes" element={<Restaurantes />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Usuarios" element={<Usuarios />} />
                
                <Route path="/Relatorios" element={<Relatorios />} />
                
                <Route path="/Pedidos" element={<Pedidos />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/RestaurantMenu" element={<RestaurantMenu />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/MinhaConta" element={<MinhaConta />} />
                
                <Route path="/PortalEntregador" element={<PortalEntregador />} />
                
                <Route path="/CadastroEntregador" element={<CadastroEntregador />} />
                
                <Route path="/Entregadores" element={<Entregadores />} />
                <Route path="/Entregadores/:id" element={<EntregadorDetalhes />} />
                
                <Route path="/PainelEntregador" element={<PainelEntregador />} />
                
                <Route path="/PerfilEntregador" element={<PerfilEntregador />} />
                
                <Route path="/DefinicoesEntregador" element={<DefinicoesEntregador />} />
                
                <Route path="/EntregasRecentes" element={<EntregasRecentes />} />
                
                <Route path="/RestaurantDashboard" element={<RestaurantDashboard />} />
                
                <Route path="/DatabaseScripts" element={<DatabaseScripts />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/CriarConta" element={<CriarConta />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router basename={appBasePath || undefined}>
            <PagesContent />
        </Router>
    );
}

