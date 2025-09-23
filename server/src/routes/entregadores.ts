import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { userId, email, aprovado, disponivel, status, id } = req.query;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = String(userId);
    }

    if (email) {
      where.email = String(email);
    }

    if (status) {
      where.status = String(status);
    }

    if (id) {
      where.id = String(id);
    }

    if (aprovado !== undefined) {
      where.aprovado = String(aprovado) === 'true';
    }

    if (disponivel !== undefined) {
      where.disponivel = String(disponivel) === 'true';
    }

    const entregadores = await prisma.entregador.findMany({
      where,
      orderBy: { createdDate: 'desc' },
    });

    res.json(serialize(entregadores));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const entregador = await prisma.entregador.findUnique({ where: { id } });

    if (!entregador) {
      return res.status(404).json({ message: 'Entregador not found' });
    }

    res.json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.email || !data.nomeCompleto || !data.telefone) {
      return res.status(400).json({ message: 'email, nomeCompleto e telefone são obrigatórios.' });
    }

    const entregador = await prisma.entregador.create({ data });
    res.status(201).json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const entregador = await prisma.entregador.update({
      where: { id },
      data,
    });

    res.json(serialize(entregador));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.entregador.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
