import { lazy, Suspense, useMemo } from 'react';
import Layout from './Layout.jsx';
import { BrowserRouter as Router, Route, Routes, useLocation, matchPath } from 'react-router-dom';
import { appBasePath } from '@/utils';

const routesConfig = [
  { path: '/', name: 'Home', Component: lazy(() => import('./Home.jsx')) },
  { path: '/Dashboard', name: 'Dashboard', Component: lazy(() => import('./Dashboard.jsx')) },
  { path: '/Restaurantes', name: 'Restaurantes', Component: lazy(() => import('./Restaurantes.jsx')) },
  { path: '/Profile', name: 'Profile', Component: lazy(() => import('./Profile.jsx')) },
  { path: '/Usuarios', name: 'Usuarios', Component: lazy(() => import('./Usuarios.jsx')) },
  { path: '/Relatorios', name: 'Relatorios', Component: lazy(() => import('./Relatorios.jsx')) },
  { path: '/Pedidos', name: 'Pedidos', Component: lazy(() => import('./Pedidos.jsx')) },
  { path: '/RestaurantMenu', name: 'RestaurantMenu', Component: lazy(() => import('./RestaurantMenu.jsx')) },
  { path: '/Checkout', name: 'Checkout', Component: lazy(() => import('./Checkout.jsx')) },
  { path: '/Menu', name: 'Menu', Component: lazy(() => import('./Menu.jsx')) },
  { path: '/MinhaConta', name: 'MinhaConta', Component: lazy(() => import('./MinhaConta.jsx')) },
  { path: '/PortalEntregador', name: 'PortalEntregador', Component: lazy(() => import('./PortalEntregador.jsx')) },
  { path: '/CadastroEntregador', name: 'CadastroEntregador', Component: lazy(() => import('./CadastroEntregador.jsx')) },
  { path: '/Entregadores', name: 'Entregadores', Component: lazy(() => import('./Entregadores.jsx')) },
  { path: '/Entregadores/:id', name: 'Entregadores', Component: lazy(() => import('./EntregadorDetalhes.jsx')) },
  { path: '/PainelEntregador', name: 'PainelEntregador', Component: lazy(() => import('./PainelEntregador.jsx')) },
  { path: '/PerfilEntregador', name: 'PerfilEntregador', Component: lazy(() => import('./PerfilEntregador.jsx')) },
  { path: '/DefinicoesEntregador', name: 'DefinicoesEntregador', Component: lazy(() => import('./DefinicoesEntregador.jsx')) },
  { path: '/EntregasRecentes', name: 'EntregasRecentes', Component: lazy(() => import('./EntregasRecentes.jsx')) },
  { path: '/RestaurantDashboard', name: 'RestaurantDashboard', Component: lazy(() => import('./RestaurantDashboard.jsx')) },
  { path: '/DatabaseScripts', name: 'DatabaseScripts', Component: lazy(() => import('./DatabaseScripts.jsx')) },
  { path: '/Login', name: 'Login', Component: lazy(() => import('./Login.jsx')) },
  { path: '/CriarConta', name: 'CriarConta', Component: lazy(() => import('./CriarConta.jsx')) },
];

function PagesContent() {
  const location = useLocation();

  const currentRoute = useMemo(() => {
    for (const route of routesConfig) {
      const match = matchPath({ path: route.path, caseSensitive: false, end: route.path === '/' }, location.pathname);
      if (match) {
        return route;
      }
    }
    return routesConfig[0];
  }, [location.pathname]);

  return (
    <Layout currentPageName={currentRoute?.name ?? 'Home'}>
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Carregando…</div>}>
        <Routes>
          {routesConfig.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </Suspense>
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

