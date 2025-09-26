import { Router } from 'express';
import { ErrorCode } from '../shared/error-codes';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { buildErrorPayload } from '../utils/errors';
import requireScope from '../middleware/require-scope';

const router = Router();

router.get('/', requireScope('deliveries:read'), async (req, res, next) => {
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

router.get('/:id', requireScope('deliveries:read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({ where: { id } });

    if (!delivery) {
      return res.status(404).json(buildErrorPayload(ErrorCode.DELIVERY_NOT_FOUND, 'Entrega não encontrada.'));
    }

    res.json(serialize(delivery));
  } catch (error) {
    next(error);
  }
});

router.post('/', requireScope('deliveries:write'), async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.orderId || !data.enderecoColeta || !data.enderecoEntrega || data.valorFrete === undefined) {
      return res.status(400).json(
        buildErrorPayload(
          ErrorCode.VALIDATION_ERROR,
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

router.put('/:id', requireScope('deliveries:write'), async (req, res, next) => {
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
