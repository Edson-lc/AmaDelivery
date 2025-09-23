import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { serialize } from '../utils/serialization';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, restaurantId, customerId, entregadorId, dateFrom, dateTo } = req.query;

    const filters: Record<string, unknown> = {};

    if (status) {
      filters.status = String(status);
    }

    if (restaurantId) {
      filters.restaurantId = String(restaurantId);
    }

    if (customerId) {
      filters.customerId = String(customerId);
    }

    if (entregadorId) {
      filters.entregadorId = String(entregadorId);
    }

    const dateFilter: Record<string, Date> = {};

    if (dateFrom) {
      dateFilter.gte = new Date(String(dateFrom));
    }

    if (dateTo) {
      dateFilter.lte = new Date(String(dateTo));
    }

    const where = {
      ...filters,
      ...(Object.keys(dateFilter).length > 0
        ? { createdDate: dateFilter }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdDate: 'desc' },
      include: {
        restaurant: true,
        customer: true,
        entregador: true,
        delivery: true,
      },
    });

    res.json(serialize(orders));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        customer: true,
        entregador: true,
        delivery: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(serialize(order));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      customerId,
      restaurantId,
      entregadorId,
      numeroPedido,
      clienteNome,
      clienteTelefone,
      clienteEmail,
      enderecoEntrega,
      itens,
      subtotal,
      taxaEntrega,
      taxaServico,
      desconto,
      cupomUsado,
      total,
      status = 'pendente_pagamento',
      formaPagamento,
      pagamentoStatus = 'pendente',
      pagamentoId,
      tempoEstimadoPreparo,
      tempoEstimadoEntrega,
      observacoesCliente,
      observacoesRestaurante,
      historicoStatus,
      dataConfirmacao,
      dataEntrega,
      avaliacao,
    } = req.body ?? {};

    if (!restaurantId || !clienteNome || !clienteTelefone || !enderecoEntrega || !itens || subtotal === undefined || total === undefined) {
      return res.status(400).json({
        message: 'Campos obrigatórios: restaurantId, clienteNome, clienteTelefone, enderecoEntrega, itens, subtotal, total.',
      });
    }

    const generatedNumber = numeroPedido ?? `AMA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        entregadorId,
        numeroPedido: generatedNumber,
        clienteNome,
        clienteTelefone,
        clienteEmail,
        enderecoEntrega,
        itens,
        subtotal,
        taxaEntrega,
        taxaServico,
        desconto,
        cupomUsado,
        total,
        status,
        formaPagamento,
        pagamentoStatus,
        pagamentoId,
        tempoEstimadoPreparo,
        tempoEstimadoEntrega,
        observacoesCliente,
        observacoesRestaurante,
        historicoStatus:
          historicoStatus ?? [
            {
              status,
              timestamp: new Date().toISOString(),
              note: 'Order created',
            },
          ],
        dataConfirmacao,
        dataEntrega,
        avaliacao,
      },
    });

    res.status(201).json(serialize(order));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body ?? {};

    const order = await prisma.order.update({
      where: { id },
      data,
    });

    res.json(serialize(order));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body ?? {};

    if (!status) {
      return res.status(400).json({ message: 'status é obrigatório.' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const historyEntries = Array.isArray(existing.historicoStatus)
      ? [...(existing.historicoStatus as Prisma.JsonArray)]
      : [];

    historyEntries.push({ status, note, timestamp: new Date().toISOString() });

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        historicoStatus: historyEntries as Prisma.InputJsonValue,
      },
    });

    res.json(serialize(order));
  } catch (error) {
    next(error);
  }
});

export default router;
