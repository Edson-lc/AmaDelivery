import React, { useState } from 'react';
import { Copy, Download, Check, Database, FileText, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function DatabaseScripts() {
    const [copiedScript, setCopiedScript] = useState(null);

    const copyToClipboard = async (text, scriptName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedScript(scriptName);
            setTimeout(() => setCopiedScript(null), 2000);
        } catch (err) {
            console.error('Erro ao copiar: ', err);
        }
    };

    const downloadScript = (content, filename) => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/sql' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const script1_tables = `-- ============================================================================
-- SISTEMA AMAEATS - SCRIPTS DE CRIAÇÃO DO BANCO DE DADOS POSTGRESQL
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABELA: users (Utilizadores do Sistema)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Campos obrigatórios do sistema base44
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    
    -- Campos específicos da aplicação
    tipo_usuario VARCHAR(50) DEFAULT 'cliente' CHECK (tipo_usuario IN ('admin', 'restaurante', 'cliente', 'entregador')),
    nome VARCHAR(100),
    sobrenome VARCHAR(100),
    telefone VARCHAR(20),
    nif VARCHAR(20),
    data_nascimento DATE,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    restaurant_id UUID, -- FK para restaurants (será criada depois)
    consentimento_dados BOOLEAN DEFAULT FALSE,
    
    -- Arrays JSON para endereços e métodos de pagamento
    enderecos_salvos JSONB DEFAULT '[]',
    metodos_pagamento_salvos JSONB DEFAULT '[]'
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tipo_usuario ON users(tipo_usuario);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id);

-- ============================================================================
-- TABELA: restaurants (Restaurantes)
-- ============================================================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) CHECK (categoria IN ('brasileira', 'italiana', 'japonesa', 'chinesa', 'arabe', 'mexicana', 'hamburguer', 'pizza', 'saudavel', 'sobremesas', 'lanches', 'outros')),
    endereco TEXT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    tempo_preparo INTEGER, -- em minutos
    taxa_entrega DECIMAL(10,2),
    valor_minimo DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    avaliacao DECIMAL(3,2) CHECK (avaliacao >= 0 AND avaliacao <= 5),
    imagem_url TEXT,
    horario_funcionamento JSONB
);

-- Índices para restaurants
CREATE INDEX idx_restaurants_categoria ON restaurants(categoria);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_nome ON restaurants USING GIN (nome gin_trgm_ops);

-- ============================================================================
-- TABELA: menu_items (Itens do Cardápio)
-- ============================================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('entrada', 'prato_principal', 'sobremesa', 'bebida', 'lanche', 'acompanhamento')),
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT TRUE,
    tempo_preparo INTEGER, -- em minutos
    
    -- Arrays JSON para ingredientes, adicionais, etc.
    ingredientes JSONB DEFAULT '[]',
    adicionais JSONB DEFAULT '[]',
    opcoes_personalizacao JSONB DEFAULT '[]',
    alergenos JSONB DEFAULT '[]'
);

-- Índices para menu_items
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_categoria ON menu_items(categoria);
CREATE INDEX idx_menu_items_disponivel ON menu_items(disponivel);
CREATE INDEX idx_menu_items_nome ON menu_items USING GIN (nome gin_trgm_ops);

-- ============================================================================
-- TABELA: customers (Clientes)
-- ============================================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20) NOT NULL,
    endereco_principal TEXT,
    enderecos_salvos JSONB DEFAULT '[]',
    preferencias JSONB DEFAULT '{}',
    total_pedidos INTEGER DEFAULT 0,
    valor_gasto_total DECIMAL(10,2) DEFAULT 0,
    data_ultimo_pedido TIMESTAMP WITH TIME ZONE
);

-- Índices para customers
CREATE INDEX idx_customers_telefone ON customers(telefone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_nome ON customers USING GIN (nome gin_trgm_ops);

-- ============================================================================
-- TABELA: entregadores (Entregadores)
-- ============================================================================
CREATE TABLE entregadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT,
    nif VARCHAR(20),
    data_nascimento DATE,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    aprovado BOOLEAN DEFAULT FALSE,
    veiculo_tipo VARCHAR(20) CHECK (veiculo_tipo IN ('bicicleta', 'moto', 'carro', 'pe')),
    veiculo_placa VARCHAR(20),
    disponivel BOOLEAN DEFAULT FALSE,
    avaliacao DECIMAL(3,2) DEFAULT 0 CHECK (avaliacao >= 0 AND avaliacao <= 5),
    total_entregas INTEGER DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    iban VARCHAR(34),
    nome_banco VARCHAR(100),
    ultimo_login TIMESTAMP WITH TIME ZONE
);

-- Índices para entregadores
CREATE INDEX idx_entregadores_email ON entregadores(email);
CREATE INDEX idx_entregadores_aprovado ON entregadores(aprovado);
CREATE INDEX idx_entregadores_disponivel ON entregadores(disponivel);
CREATE INDEX idx_entregadores_location ON entregadores(latitude, longitude);

-- ============================================================================
-- TABELA: carts (Carrinhos de Compras)
-- ============================================================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    session_id VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    itens JSONB DEFAULT '[]',
    subtotal DECIMAL(10,2) DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para carts
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_restaurant_id ON carts(restaurant_id);
CREATE INDEX idx_carts_data_atualizacao ON carts(data_atualizacao);

-- ============================================================================
-- TABELA: orders (Pedidos)
-- ============================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    customer_id UUID REFERENCES customers(id),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    entregador_id UUID REFERENCES entregadores(id),
    numero_pedido VARCHAR(50) UNIQUE,
    
    -- Dados do cliente
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    endereco_entrega JSONB NOT NULL,
    
    -- Itens e valores
    itens JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    taxa_servico DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    cupom_usado VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    
    -- Status e pagamento
    status VARCHAR(30) DEFAULT 'pendente_pagamento' CHECK (status IN ('pendente_pagamento', 'pago', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado', 'rejeitado')),
    forma_pagamento VARCHAR(30) CHECK (forma_pagamento IN ('cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'vale_refeicao')),
    pagamento_status VARCHAR(20) DEFAULT 'pendente' CHECK (pagamento_status IN ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
    pagamento_id VARCHAR(100),
    
    -- Tempos
    tempo_estimado_preparo INTEGER,
    tempo_estimado_entrega INTEGER,
    
    -- Observações
    observacoes_cliente TEXT,
    observacoes_restaurante TEXT,
    
    -- Histórico e datas
    historico_status JSONB DEFAULT '[]',
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    data_entrega TIMESTAMP WITH TIME ZONE,
    
    -- Avaliação
    avaliacao JSONB
);

-- Índices para orders
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_entregador_id ON orders(entregador_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_numero_pedido ON orders(numero_pedido);
CREATE INDEX idx_orders_created_date ON orders(created_date DESC);
CREATE INDEX idx_orders_cliente_telefone ON orders(cliente_telefone);

-- ============================================================================
-- TABELA: deliveries (Entregas)
-- ============================================================================
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    order_id UUID NOT NULL REFERENCES orders(id),
    entregador_id UUID REFERENCES entregadores(id),
    status VARCHAR(30) DEFAULT 'aguardando_aceite' CHECK (status IN ('aguardando_aceite', 'aceito', 'coletado', 'a_caminho', 'entregue', 'cancelado')),
    
    endereco_coleta TEXT NOT NULL,
    endereco_entrega TEXT NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    restaurante_nome VARCHAR(255) NOT NULL,
    
    valor_frete DECIMAL(10,2) NOT NULL,
    distancia_km DECIMAL(10,2),
    tempo_estimado_min INTEGER,
    
    data_aceite TIMESTAMP WITH TIME ZONE,
    data_coleta TIMESTAMP WITH TIME ZONE,
    data_finalizacao TIMESTAMP WITH TIME ZONE,
    
    avaliacao_cliente INTEGER CHECK (avaliacao_cliente >= 1 AND avaliacao_cliente <= 5),
    comentario_cliente TEXT
);

-- Índices para deliveries
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_entregador_id ON deliveries(entregador_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_date ON deliveries(created_date DESC);

-- ============================================================================
-- TABELA: alteracoes_perfil (Solicitações de Alteração de Perfil)
-- ============================================================================
CREATE TABLE alteracoes_perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    entregador_id UUID NOT NULL REFERENCES entregadores(id),
    dados_antigos JSONB NOT NULL,
    dados_novos JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    observacoes_admin TEXT
);

-- Índices para alteracoes_perfil
CREATE INDEX idx_alteracoes_perfil_entregador_id ON alteracoes_perfil(entregador_id);
CREATE INDEX idx_alteracoes_perfil_status ON alteracoes_perfil(status);`;

    const script2_foreign_keys = `-- ============================================================================
-- CHAVES ESTRANGEIRAS ADICIONAIS
-- ============================================================================

-- Adicionar FK de users para restaurants (após restaurants ser criada)
ALTER TABLE users 
ADD CONSTRAINT fk_users_restaurant_id 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL;`;

    const script3_triggers = `-- ============================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_date
-- ============================================================================

-- Função para atualizar updated_date
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_restaurants_updated_date BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_menu_items_updated_date BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_customers_updated_date BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_entregadores_updated_date BEFORE UPDATE ON entregadores FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_carts_updated_date BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_orders_updated_date BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_deliveries_updated_date BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_alteracoes_perfil_updated_date BEFORE UPDATE ON alteracoes_perfil FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();`;

    const script4_sample_data = `-- ============================================================================
-- DADOS DE EXEMPLO PARA TESTES
-- ============================================================================

-- Inserir usuário administrador
INSERT INTO users (id, full_name, email, role, tipo_usuario, nome, sobrenome, telefone, status) 
VALUES (
    uuid_generate_v4(),
    'Administrador AmaEats',
    'admin@amaeats.com',
    'admin',
    'admin',
    'Administrador',
    'AmaEats',
    '+351 910 000 000',
    'ativo'
);

-- Inserir restaurantes de exemplo
INSERT INTO restaurants (nome, descricao, categoria, endereco, telefone, email, tempo_preparo, taxa_entrega, valor_minimo, status, avaliacao) VALUES
('Pizzaria Bella Vista', 'Autênticas pizzas italianas com ingredientes frescos', 'italiana', 'Rua das Flores, 123, Lisboa', '+351 210 123 456', 'bella@pizza.pt', 30, 2.50, 10.00, 'ativo', 4.5),
('Burger House', 'Hambúrgueres artesanais e batatas rústicas', 'hamburguer', 'Avenida da Liberdade, 456, Lisboa', '+351 210 789 012', 'info@burgerhouse.pt', 25, 3.00, 8.00, 'ativo', 4.2),
('Sushi Zen', 'Sushi fresco preparado por mestres japoneses', 'japonesa', 'Rua do Ouro, 789, Porto', '+351 220 345 678', 'zen@sushi.pt', 35, 4.00, 15.00, 'ativo', 4.8);

-- Inserir alguns itens de menu de exemplo
INSERT INTO menu_items (restaurant_id, nome, descricao, preco, categoria, disponivel, tempo_preparo) VALUES
((SELECT id FROM restaurants WHERE nome = 'Pizzaria Bella Vista'), 'Pizza Margherita', 'Molho de tomate, mozzarella e manjericão fresco', 12.50, 'prato_principal', true, 20),
((SELECT id FROM restaurants WHERE nome = 'Pizzaria Bella Vista'), 'Pizza Pepperoni', 'Molho de tomate, mozzarella e pepperoni', 14.00, 'prato_principal', true, 20),
((SELECT id FROM restaurants WHERE nome = 'Burger House'), 'Classic Burger', 'Hambúrguer de carne com queijo, alface e tomate', 8.50, 'prato_principal', true, 15),
((SELECT id FROM restaurants WHERE nome = 'Sushi Zen'), 'Sashimi Salmão', '8 peças de sashimi de salmão fresco', 16.00, 'prato_principal', true, 10);

-- Inserir cliente de exemplo
INSERT INTO customers (nome, email, telefone, endereco_principal, total_pedidos, valor_gasto_total) VALUES
('João Silva', 'joao@email.com', '+351 912 345 678', 'Rua da Paz, 100, Lisboa', 5, 67.50);`;

    const script5_views = `-- ============================================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS E CONSULTAS
-- ============================================================================

-- View: Resumo de pedidos por restaurante
CREATE VIEW v_restaurant_summary AS
SELECT 
    r.id,
    r.nome as restaurant_name,
    r.categoria,
    r.status,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_revenue,
    AVG(o.total) as average_order_value,
    COUNT(CASE WHEN o.status = 'entregue' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'cancelado' THEN 1 END) as cancelled_orders,
    AVG(r.avaliacao) as restaurant_rating
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
GROUP BY r.id, r.nome, r.categoria, r.status, r.avaliacao;

-- View: Performance dos entregadores
CREATE VIEW v_entregador_performance AS
SELECT 
    e.id,
    e.nome_completo,
    e.veiculo_tipo,
    e.status,
    e.disponivel,
    COUNT(d.id) as total_deliveries,
    COUNT(CASE WHEN d.status = 'entregue' THEN 1 END) as completed_deliveries,
    AVG(d.avaliacao_cliente) as average_rating,
    SUM(d.valor_frete) as total_earned,
    AVG(d.distancia_km) as average_distance
FROM entregadores e
LEFT JOIN deliveries d ON e.id = d.entregador_id
GROUP BY e.id, e.nome_completo, e.veiculo_tipo, e.status, e.disponivel;

-- View: Pedidos do dia
CREATE VIEW v_todays_orders AS
SELECT 
    o.*,
    r.nome as restaurant_name,
    r.categoria as restaurant_category,
    e.nome_completo as entregador_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
LEFT JOIN entregadores e ON o.entregador_id = e.id
WHERE DATE(o.created_date) = CURRENT_DATE;

-- View: Itens mais vendidos
CREATE VIEW v_popular_items AS
SELECT 
    mi.id,
    mi.nome,
    r.nome as restaurant_name,
    mi.categoria,
    mi.preco,
    COUNT(*) as times_ordered,
    SUM(CAST(item->>'quantidade' AS INTEGER)) as total_quantity_sold
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
JOIN orders o ON o.restaurant_id = r.id
CROSS JOIN LATERAL jsonb_array_elements(o.itens) AS item
WHERE item->>'item_id' = mi.id::text
GROUP BY mi.id, mi.nome, r.nome, mi.categoria, mi.preco
ORDER BY total_quantity_sold DESC;`;

    const script6_procedures = `-- ============================================================================
-- STORED PROCEDURES E FUNÇÕES ÚTEIS
-- ============================================================================

-- Função: Calcular distância entre dois pontos (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Raio da Terra em km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    a := SIN(dLat/2) * SIN(dLat/2) + 
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
         SIN(dLon/2) * SIN(dLon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Função: Encontrar entregadores próximos
CREATE OR REPLACE FUNCTION find_nearby_drivers(
    restaurant_lat DECIMAL,
    restaurant_lon DECIMAL,
    max_distance DECIMAL DEFAULT 5.0
) RETURNS TABLE(
    entregador_id UUID,
    nome_completo VARCHAR,
    distancia DECIMAL,
    veiculo_tipo VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.nome_completo,
        calculate_distance(restaurant_lat, restaurant_lon, e.latitude, e.longitude) as dist,
        e.veiculo_tipo
    FROM entregadores e
    WHERE e.aprovado = true 
      AND e.disponivel = true
      AND e.status = 'ativo'
      AND e.latitude IS NOT NULL
      AND e.longitude IS NOT NULL
      AND calculate_distance(restaurant_lat, restaurant_lon, e.latitude, e.longitude) <= max_distance
    ORDER BY dist ASC;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Atualizar estatísticas do cliente
CREATE OR REPLACE FUNCTION update_customer_stats(customer_id_param UUID) 
RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET 
        total_pedidos = (
            SELECT COUNT(*) 
            FROM orders 
            WHERE customer_id = customer_id_param 
              AND status = 'entregue'
        ),
        valor_gasto_total = (
            SELECT COALESCE(SUM(total), 0) 
            FROM orders 
            WHERE customer_id = customer_id_param 
              AND status = 'entregue'
        ),
        data_ultimo_pedido = (
            SELECT MAX(created_date) 
            FROM orders 
            WHERE customer_id = customer_id_param
        )
    WHERE id = customer_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats do cliente automaticamente
CREATE OR REPLACE FUNCTION trigger_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status != 'entregue') THEN
        PERFORM update_customer_stats(NEW.customer_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_update_customer_stats
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_customer_stats();`;

    const allScriptsInOne = `${script1_tables}

${script2_foreign_keys}

${script3_triggers}

${script4_sample_data}

${script5_views}

${script6_procedures}`;

    const ScriptCard = ({ title, description, script, filename, icon: Icon, badge }) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {title}
                    {badge && <Badge variant="secondary">{badge}</Badge>}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => copyToClipboard(script, filename)}
                            className="flex items-center gap-2"
                        >
                            {copiedScript === filename ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadScript(script, filename)}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-40">
                        <code>{script.substring(0, 500)}...</code>
                    </pre>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                        <Database className="w-8 h-8 text-blue-600" />
                        Scripts SQL - Sistema AmaEats
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Scripts completos para criar a base de dados PostgreSQL do sistema AmaEats. 
                        Inclui todas as tabelas, índices, triggers, views e funções necessárias.
                    </p>
                </div>

                <Tabs defaultValue="individual" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">Scripts Individuais</TabsTrigger>
                        <TabsTrigger value="complete">Script Completo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="individual" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ScriptCard
                                title="01 - Criar Tabelas"
                                description="Criação de todas as tabelas principais com índices"
                                script={script1_tables}
                                filename="01_create_tables.sql"
                                icon={Database}
                                badge="Principal"
                            />
                            <ScriptCard
                                title="02 - Chaves Estrangeiras"
                                description="Relacionamentos entre tabelas"
                                script={script2_foreign_keys}
                                filename="02_foreign_keys.sql"
                                icon={Settings}
                            />
                            <ScriptCard
                                title="03 - Triggers"
                                description="Atualização automática de timestamps"
                                script={script3_triggers}
                                filename="03_triggers.sql"
                                icon={Settings}
                            />
                            <ScriptCard
                                title="04 - Dados de Exemplo"
                                description="Dados de teste para desenvolvimento"
                                script={script4_sample_data}
                                filename="04_sample_data.sql"
                                icon={FileText}
                                badge="Opcional"
                            />
                            <ScriptCard
                                title="05 - Views"
                                description="Views para relatórios e consultas"
                                script={script5_views}
                                filename="05_views.sql"
                                icon={BarChart3}
                            />
                            <ScriptCard
                                title="06 - Funções"
                                description="Stored procedures e funções úteis"
                                script={script6_procedures}
                                filename="06_procedures.sql"
                                icon={Settings}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="complete" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="w-5 h-5" />
                                    Script Completo
                                    <Badge variant="secondary">Tudo em Um</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Todos os scripts combinados num único ficheiro para instalação rápida
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => copyToClipboard(allScriptsInOne, 'complete')}
                                            className="flex items-center gap-2"
                                        >
                                            {copiedScript === 'complete' ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copiar Script Completo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadScript(allScriptsInOne, 'amaeats_complete.sql')}
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Completo
                                        </Button>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">📋 Instruções de Instalação:</h4>
                                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                            <li>Criar base de dados PostgreSQL: <code className="bg-blue-100 px-1 rounded">CREATE DATABASE amaeats;</code></li>
                                            <li>Conectar à base: <code className="bg-blue-100 px-1 rounded">\\c amaeats;</code></li>
                                            <li>Executar este script completo</li>
                                            <li>Verificar se todas as tabelas foram criadas</li>
                                        </ol>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card className="mt-8 bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">✅ Funcionalidades Incluídas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                            <div>
                                <h4 className="font-semibold mb-2">🏗️ Estrutura:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>9 Tabelas principais</li>
                                    <li>Índices otimizados</li>
                                    <li>Constraints de integridade</li>
                                    <li>Chaves estrangeiras</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">⚙️ Automação:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Triggers para timestamps</li>
                                    <li>Functions para cálculos</li>
                                    <li>Views para relatórios</li>
                                    <li>Dados de exemplo</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}