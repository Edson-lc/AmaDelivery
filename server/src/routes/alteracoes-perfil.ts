import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { buildErrorPayload } from '../utils/errors';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { entregadorId, status } = req.query;
    const pagination = parsePagination(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = {};

    if (entregadorId) {
      where.entregadorId = String(entregadorId);
    }

    if (status) {
      where.status = String(status);
    }

    const [total, changes] = await Promise.all([
      prisma.alteracaoPerfil.count({ where }),
      prisma.alteracaoPerfil.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        ...(pagination.limit !== undefined ? { take: pagination.limit } : {}),
        ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
      }),
    ]);

    applyPaginationHeaders(res, pagination, total);

    res.json(serialize(changes));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.entregadorId || !data.dadosAntigos || !data.dadosNovos) {
      return res
        .status(400)
        .json(buildErrorPayload('VALIDATION_ERROR', 'entregadorId, dadosAntigos e dadosNovos são obrigatórios.'));
    }

    const change = await prisma.alteracaoPerfil.create({ data });
    res.status(201).json(serialize(change));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const change = await prisma.alteracaoPerfil.update({
      where: { id },
      data,
    });

    res.json(serialize(change));
  } catch (error) {
    next(error);
  }
});

export default router;
