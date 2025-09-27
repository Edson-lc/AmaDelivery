import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  buildUserCreateData,
  buildUserUpdateData,
  parseUserCreateInput,
  parseUserUpdateInput,
} from './users';

describe('user validation helpers', () => {
  it('normalizes fields for creation', () => {
    const payload = parseUserCreateInput({
      email: ' Teste@Example.com ',
      fullName: '  Maria da Silva  ',
      password: 'supersegura',
      telefone: ' 12345 ',
      endereco: { rua: ' Rua Principal ', numero: '100', complemento: '' },
      consentimentoDados: 'true',
      restaurant_id: '5dc8bb3f-3e10-4d5c-a561-d1d55c7f9c5f',
    });

    expect(payload.email).toBe('teste@example.com');
    expect(payload.fullName).toBe('Maria da Silva');
    expect(payload.telefone).toBe('12345');
    expect(payload.consentimentoDados).toBe(true);
    expect(payload.restaurantId).toBe('5dc8bb3f-3e10-4d5c-a561-d1d55c7f9c5f');
    expect(payload.addressesFromEndereco).toEqual([{ rua: 'Rua Principal', numero: '100' }]);
  });

  it('produces prisma create data with hashed password', () => {
    const payload = parseUserCreateInput({
      email: 'user@example.com',
      fullName: 'Usuário',
      password: 'minhasenha',
      tipo_usuario: 'admin',
      metodosPagamento: [{ type: 'card' }],
      enderecosSalvos: [
        { rua: 'Rua 1', numero: '1' },
      ],
    });

    const data = buildUserCreateData(payload, 'hashed');

    expect(data).toMatchObject({
      email: 'user@example.com',
      fullName: 'Usuário',
      tipoUsuario: 'admin',
      passwordHash: 'hashed',
      metodosPagamento: [{ type: 'card' }],
      enderecosSalvos: [{ rua: 'Rua 1', numero: '1' }],
    });
  });

  it('builds update payload disconnecting restaurant and clearing addresses', () => {
    const payload = parseUserUpdateInput({
      fullName: '  Novo Nome  ',
      restaurantId: null,
      enderecosSalvos: null,
    });

    const data = buildUserUpdateData(payload);

    expect(data.fullName).toBe('Novo Nome');
    expect(data.restaurant).toEqual({ disconnect: true });
    expect(data.enderecosSalvos).toEqual([]);
  });

  it('rejects invalid email addresses', () => {
    expect(() =>
      parseUserCreateInput({
        email: 'not-an-email',
        fullName: 'Teste',
        password: 'senha123',
      }),
    ).toThrow(ZodError);
  });
});
