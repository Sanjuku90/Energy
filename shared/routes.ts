import { z } from 'zod';
import { insertUserSchema, insertTransactionSchema, users, plans, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  plans: {
    list: {
      method: 'GET' as const,
      path: '/api/plans',
      responses: {
        200: z.array(z.custom<typeof plans.$inferSelect>()),
      },
    },
    purchase: {
      method: 'POST' as const,
      path: '/api/plans/purchase',
      input: z.object({ planId: z.number() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: z.object({ message: z.string() }), // Insufficient funds
        404: errorSchemas.notFound,
      },
    },
  },
  mining: {
    heartbeat: {
      method: 'POST' as const,
      path: '/api/mining/heartbeat',
      input: z.object({ connectedSeconds: z.number() }),
      responses: {
        200: z.object({
          earnedAmount: z.number(),
          newBalance: z.number(),
          energyProduced: z.number(),
        }),
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/transactions/withdraw',
      input: z.object({
        amount: z.number().positive(),
        method: z.string(),
        destination: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
