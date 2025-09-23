import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { entregadorId, orderId, status } = req.query;

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

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdDate: 'desc' },
    });

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
      return res.status(404).json({ message: 'Delivery not found' });
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
      return res.status(400).json({ message: 'orderId, enderecoColeta, enderecoEntrega e valorFrete são obrigatórios.' });
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
