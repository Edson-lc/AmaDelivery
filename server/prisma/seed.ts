import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

const defaultRestaurants = [
  {
    nome: 'AmaEats Central',
    descricao: 'Restaurante conceito com pratos variados do AmaEats.',
    categoria: 'brasileira',
    endereco: 'Rua Principal, 1000, Lisboa',
    telefone: '+351 910 000 001',
    email: 'central@amaeats.com',
    tempoPreparo: 25,
    taxaEntrega: 2.5,
    valorMinimo: 8,
    imagemUrl: 'https://picsum.photos/seed/central/400/240',
    avaliacao: 4.7,
    menuItems: [
      {
        nome: 'Feijoada Gourmet',
        descricao: 'Feijoada completa com ingredientes selecionados.',
        preco: 14.9,
        categoria: 'prato_principal',
      },
      {
        nome: 'Coxinha Artesanal',
        descricao: 'Coxinha de frango com catupiry, massa leve.',
        preco: 4.5,
        categoria: 'lanche',
      },
    ],
  },
  {
    nome: 'Mediterrâneo Fresh',
    descricao: 'Sabores mediterrâneos com ingredientes frescos e saudáveis.',
    categoria: 'saudavel',
    endereco: 'Avenida do Mar, 250, Porto',
    telefone: '+351 920 111 222',
    email: 'contact@mediterraneofresh.pt',
    tempoPreparo: 20,
    taxaEntrega: 1.8,
    valorMinimo: 6,
    imagemUrl: 'https://picsum.photos/seed/mediterraneo/400/240',
    avaliacao: 4.5,
    menuItems: [
      {
        nome: 'Salada Mediterrânea',
        descricao: 'Mix de folhas, tomate, azeitonas, queijo feta e molho especial.',
        preco: 9.9,
        categoria: 'prato_principal',
      },
      {
        nome: 'Wrap de Falafel',
        descricao: 'Falafel no pão pita com hummus e vegetais frescos.',
        preco: 8.5,
        categoria: 'lanche',
      },
    ],
  },
  {
    nome: 'Sushi Express Ama',
    descricao: 'Combinados de sushi prontos para entrega rápida.',
    categoria: 'japonesa',
    endereco: 'Rua das Flores, 78, Coimbra',
    telefone: '+351 930 333 444',
    email: 'hello@sushiexpressama.pt',
    tempoPreparo: 30,
    taxaEntrega: 3.2,
    valorMinimo: 12,
    imagemUrl: 'https://picsum.photos/seed/sushi/400/240',
    avaliacao: 4.8,
    menuItems: [
      {
        nome: 'Combinado 24 peças',
        descricao: 'Seleção de sushis e sashimis frescos do dia.',
        preco: 24.9,
        categoria: 'prato_principal',
      },
      {
        nome: 'Uramaki Philadelphia',
        descricao: 'Salmão, cream cheese e cebolinha.',
        preco: 11.5,
        categoria: 'prato_principal',
      },
    ],
  },
];

async function seedRestaurants() {
  console.log('Iniciando seed de restaurantes...');

  for (const data of defaultRestaurants) {
    const existing = await prisma.restaurant.findFirst({ where: { nome: data.nome } });

    if (existing) {
      console.log('Restaurante já existe, ignorando:', data.nome);
      continue;
    }

    await prisma.restaurant.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        endereco: data.endereco,
        telefone: data.telefone,
        email: data.email,
        tempoPreparo: data.tempoPreparo,
        taxaEntrega: data.taxaEntrega,
        valorMinimo: data.valorMinimo,
        imagemUrl: data.imagemUrl,
        avaliacao: data.avaliacao,
        menuItems: {
          create: data.menuItems.map((item) => ({
            nome: item.nome,
            descricao: item.descricao,
            preco: item.preco,
            categoria: item.categoria,
            disponivel: true,
          })),
        },
      },
    });

    console.log('Restaurante criado:', data.nome);
  }

  console.log('Seed de restaurantes concluído.');
}

async function seedUsers() {
  console.log('Iniciando seed de usuários...');

  const passwordHash = await bcrypt.hash('123456', 10);
  const restaurants = await prisma.restaurant.findMany({ select: { id: true, nome: true } });
  const restaurantMap = new Map(restaurants.map((r) => [r.nome, r.id]));

  const userSeeds = [
    {
      email: 'admin@amaeats.com',
      fullName: 'Administrador AmaEats',
      role: 'admin',
      tipoUsuario: 'admin',
      nome: 'Administrador',
      sobrenome: 'AmaEats',
    },
    {
      email: 'cliente@amaeats.com',
      fullName: 'Cliente AmaEats',
      role: 'user',
      tipoUsuario: 'cliente',
      nome: 'Cliente',
      sobrenome: 'AmaEats',
    },
    {
      email: 'restaurante@amaeats.com',
      fullName: 'Gestor Restaurante',
      role: 'user',
      tipoUsuario: 'restaurante',
      nome: 'Gestor',
      sobrenome: 'Restaurante',
      restaurantName: 'AmaEats Central',
    },
    {
      email: 'entregador@amaeats.com',
      fullName: 'Entregador AmaEats',
      role: 'user',
      tipoUsuario: 'entregador',
      nome: 'Entregador',
      sobrenome: 'AmaEats',
    },
  ];

  for (const info of userSeeds) {
    const baseData: Prisma.UserUncheckedCreateInput = {
      fullName: info.fullName,
      email: info.email.toLowerCase(),
      role: info.role,
      tipoUsuario: info.tipoUsuario,
      nome: info.nome,
      sobrenome: info.sobrenome,
      passwordHash,
      status: 'ativo',
    };

    if (info.restaurantName) {
      const restaurantId = restaurantMap.get(info.restaurantName);
      if (restaurantId) {
        baseData.restaurantId = restaurantId;
      }
    }

    const user = await prisma.user.upsert({
      where: { email: baseData.email },
      update: {
        fullName: baseData.fullName,
        role: baseData.role,
        tipoUsuario: baseData.tipoUsuario,
        nome: baseData.nome,
        sobrenome: baseData.sobrenome,
        restaurantId: baseData.restaurantId ?? null,
        passwordHash: baseData.passwordHash,
        status: baseData.status,
      },
      create: baseData,
    });

    if (info.tipoUsuario === 'entregador') {
      await prisma.entregador.upsert({
        where: { userId: user.id },
        update: {
          nomeCompleto: info.fullName,
          telefone: '+351 910 000 999',
          status: 'ativo',
          aprovado: true,
        },
        create: {
          userId: user.id,
          email: info.email.toLowerCase(),
          nomeCompleto: info.fullName,
          telefone: '+351 910 000 999',
          status: 'ativo',
          aprovado: true,
        },
      });
    }
  }

  console.log('Seed de usuários concluído.');
}

export async function seed() {
  await seedRestaurants();
  await seedUsers();
}

seed()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
