import { Router } from 'express';
import { ErrorCode } from '../shared/error-codes';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';
import { parsePagination, applyPaginationHeaders } from '../utils/pagination';
import { buildErrorPayload } from '../utils/errors';
import requireScope from '../middleware/require-scope';

const router = Router();

router.get('/', requireScope('customers:read'), async (req, res, next) => {
  try {
    const { telefone, email, nome, id } = req.query;
    const pagination = parsePagination(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = {};

    if (telefone) {
      where.telefone = String(telefone);
    }

    if (email) {
      where.email = String(email);
    }

    if (nome) {
      where.nome = { contains: String(nome), mode: 'insensitive' };
    }

    if (id) {
      where.id = String(id);
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        ...(pagination.limit !== undefined ? { take: pagination.limit } : {}),
        ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
      }),
    ]);

    applyPaginationHeaders(res, pagination, total);

    res.json(serialize(customers));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireScope('customers:read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json(buildErrorPayload(ErrorCode.CUSTOMER_NOT_FOUND, 'Cliente não encontrado.'));
    }

    res.json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

router.post('/', requireScope('customers:write'), async (req, res, next) => {
  try {
    const data = req.body ?? {};

    if (!data.nome || !data.telefone) {
      return res
        .status(400)
        .json(buildErrorPayload(ErrorCode.VALIDATION_ERROR, 'nome e telefone são obrigatórios.'));
    }

    const customer = await prisma.customer.create({ data });
    res.status(201).json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireScope('customers:write'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    res.json(serialize(customer));
  } catch (error) {
    next(error);
  }
});

export default router;
