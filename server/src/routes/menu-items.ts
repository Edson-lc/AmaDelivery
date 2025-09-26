import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { buildErrorPayload } from '../utils/errors';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { restaurantId, category, available, search } = req.query;
    const pagination = parsePagination(req.query as Record<string, unknown>);

    const filters: Record<string, unknown> = {};

    if (restaurantId) {
      filters.restaurantId = String(restaurantId);
    }

    if (category) {
      filters.categoria = String(category).toLowerCase();
    }

    if (available !== undefined) {
      filters.disponivel = String(available) === 'true';
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

    const [total, menuItems] = await Promise.all([
      prisma.menuItem.count({ where }),
      prisma.menuItem.findMany({
        where,
        orderBy: { nome: 'asc' },
        ...(pagination.limit !== undefined ? { take: pagination.limit } : {}),
        ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
      }),
    ]);

    applyPaginationHeaders(res, pagination, total);

    res.json(serialize(menuItems));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return res.status(404).json(buildErrorPayload('MENU_ITEM_NOT_FOUND', 'Item de menu não encontrado.'));
    }

    res.json(serialize(menuItem));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.restaurantId) {
      return res.status(400).json(buildErrorPayload('VALIDATION_ERROR', 'restaurantId é obrigatório.'));
    }

    if (!data.nome || data.preco === undefined) {
      return res.status(400).json(buildErrorPayload('VALIDATION_ERROR', 'nome e preco são obrigatórios.'));
    }

    const menuItem = await prisma.menuItem.create({ data });
    res.status(201).json(serialize(menuItem));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data,
    });

    res.json(serialize(menuItem));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
