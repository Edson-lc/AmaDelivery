import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, includeMenuItems } = req.query;

    const filters: Record<string, unknown> = {};

    if (category) {
      filters.categoria = String(category).toLowerCase();
    }

    if (status) {
      filters.status = String(status).toLowerCase();
    }

    const where = {
      ...filters,
      ...(search
        ? {
            OR: [
              { nome: { contains: String(search), mode: Prisma.QueryMode.insensitive } },
              { descricao: { contains: String(search), mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy: { createdDate: 'desc' },
      include:
        includeMenuItems === 'true'
          ? { menuItems: { orderBy: { nome: 'asc' } } }
          : undefined,
    });

    res.json(serialize(restaurants));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(serialize(restaurant));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      nome,
      descricao,
      categoria,
      endereco,
      telefone,
      email,
      tempoPreparo,
      taxaEntrega,
      valorMinimo,
      status,
      avaliacao,
      imagemUrl,
      horarioFuncionamento,
    } = req.body ?? {};

    if (!nome || !endereco || !telefone) {
      return res.status(400).json({ message: 'nome, endereco e telefone são obrigatórios.' });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        nome,
        descricao,
        categoria,
        endereco,
        telefone,
        email,
        tempoPreparo,
        taxaEntrega,
        valorMinimo,
        status,
        avaliacao,
        imagemUrl,
        horarioFuncionamento,
      },
    });

    res.status(201).json(serialize(restaurant));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data,
    });

    res.json(serialize(restaurant));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.restaurant.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
