import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { buildErrorPayload } from '../utils/errors';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { entregadorId, orderId, status } = req.query;
    const pagination = parsePagination(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = {};

    if (entregadorId) {
      where.entregadorId = String(entregadorId);
    }

    if (orderId) {
      where.orderId = String(orderId);
    }

    if (status) {
      where.status = String(status);
    }

    const [total, deliveries] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        ...(pagination.limit !== undefined ? { take: pagination.limit } : {}),
        ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
      }),
    ]);

    applyPaginationHeaders(res, pagination, total);

    res.json(serialize(deliveries));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({ where: { id } });

    if (!delivery) {
      return res.status(404).json(buildErrorPayload('DELIVERY_NOT_FOUND', 'Entrega não encontrada.'));
    }

    res.json(serialize(delivery));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.orderId || !data.enderecoColeta || !data.enderecoEntrega || data.valorFrete === undefined) {
      return res
        .status(400)
        .json(
          buildErrorPayload(
            'VALIDATION_ERROR',
            'orderId, enderecoColeta, enderecoEntrega e valorFrete são obrigatórios.',
          ),
        );
    }

    const delivery = await prisma.delivery.create({ data });
    res.status(201).json(serialize(delivery));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const delivery = await prisma.delivery.update({
      where: { id },
      data,
    });

    res.json(serialize(delivery));
  } catch (error) {
    next(error);
  }
});

export default router;
