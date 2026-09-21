import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { run, get } from '../db/database.ts';
import { LoginBodySchema } from '../schemas/index.ts';

export const authRoutes: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/auth/login',
    {
      schema: {
        description: 'Login',
        tags: ['auth'],
        body: LoginBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  permissions: { type: 'array', items: { type: 'string' } },
                },
                required: ['id', 'username'],
              },
            },
            required: ['token', 'user'],
          },
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body as { username: string; password: string };
      const user = get(
        'SELECT id, username, email, role, permissions FROM users WHERE username = ?',
        [username]
      ) as any;
      const passwordHash = get('SELECT password FROM users WHERE username = ?', [username]) as any;
      if (!user || !passwordHash || !(await bcrypt.compare(password, passwordHash.password))) {
        return (reply as any)
          .status(401)
          .send({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
      }
      const token = (fastify as any).jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]'),
      });
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: JSON.parse(user.permissions || '[]'),
        },
      };
    }
  );

  fastify.post(
    '/auth/register',
    {
      schema: {
        description: 'Register a user',
        tags: ['auth'],
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            company: { type: 'string' },
          },
          required: ['email', 'password'],
          additionalProperties: false,
        },
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['id', 'username', 'email'],
              },
            },
            required: ['user'],
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
      };
      const username = body.email;
      const existing = get('SELECT id FROM users WHERE username = ?', [username]);
      if (existing) {
        return (reply as any).code(409).send({
          error: { code: 'CONFLICT', message: 'User already exists' },
        });
      }

      const id = randomUUID();
      const password = await bcrypt.hash(body.password, 10);
      run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [id, username, password]);

      return reply.status(201).send({
        user: {
          id,
          username,
          email: body.email,
          name: [body.firstName, body.lastName].filter(Boolean).join(' '),
        },
      });
    }
  );

  fastify.get(
    '/auth/me',
    {
      schema: {
        description: 'Get current authenticated user',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                },
                required: ['id', 'username'],
              },
            },
            required: ['user'],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await (request as any).jwtVerify();
      } catch {
        return (reply as any)
          .status(401)
          .send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' } });
      }
      const user = (request as any).user as { id: string; username: string };
      const dbUser = get('SELECT id, username FROM users WHERE id = ?', [user.id]) as any;
      if (!dbUser) {
        return (reply as any)
          .status(401)
          .send({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
      }
      return { user: { id: dbUser.id, username: dbUser.username } };
    }
  );
};
