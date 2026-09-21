import { FastifyPluginAsync } from 'fastify';
import { adminService } from '../services/admin.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';
import type { UserRole } from '@smart-device-cloud/shared';

const CreateUserSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 8 },
    role: { type: 'string', enum: ['owner', 'administrator', 'operator', 'developer', 'viewer'] },
    permissions: { type: 'array', items: { type: 'string' } },
  },
  required: ['email', 'name', 'password', 'role'],
  additionalProperties: false,
} as const;

const UpdateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    role: { type: 'string', enum: ['owner', 'administrator', 'operator', 'developer', 'viewer'] },
    permissions: { type: 'array', items: { type: 'string' } },
    isActive: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

export const adminRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/admin/users',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'List all users',
        tags: ['admin'],
        querystring: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            limit: { type: 'number', default: 50 },
            offset: { type: 'number', default: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    permissions: { type: 'array', items: { type: 'string' } },
                    isActive: { type: 'boolean' },
                    lastLoginAt: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                  },
                },
              },
              total: { type: 'number' },
            },
          },
        },
      },
    },
    async request => {
      const query = request.query as {
        role?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
      };
      const result = await adminService.listUsers({
        role: query.role as UserRole | undefined,
        isActive: query.isActive,
        limit: query.limit,
        offset: query.offset,
      });
      return result;
    }
  );

  fastify.get(
    '/admin/users/:id',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'Get user by ID',
        tags: ['admin'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  permissions: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                  lastLoginAt: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'object' },
            },
          },
        },
      },
    },
    async request => {
      const { id } = request.params as { id: string };
      const user = await adminService.getUser(id);
      if (!user) {
        return (request as any).reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      }
      return { user };
    }
  );

  fastify.post(
    '/admin/users',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'Create a new user',
        tags: ['admin'],
        body: CreateUserSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  permissions: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        email: string;
        name: string;
        password: string;
        role: string;
        permissions?: string[];
      };
      const user = await adminService.createUser({
        ...body,
        role: body.role as UserRole,
      });
      return reply.status(201).send({ user });
    }
  );

  fastify.put(
    '/admin/users/:id',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'Update user',
        tags: ['admin'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: UpdateUserSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  permissions: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        name?: string;
        role?: string;
        permissions?: string[];
        isActive?: boolean;
      };
      const user = await adminService.updateUser(id, {
        ...body,
        role: body.role as UserRole | undefined,
      });
      if (!user) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      }
      return { user };
    }
  );

  fastify.delete(
    '/admin/users/:id',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'Delete user',
        tags: ['admin'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await adminService.deleteUser(id);
      return { success: true };
    }
  );

  fastify.get(
    '/admin/roles',
    {
      preHandler: [requirePermission(PERMISSIONS.MANAGE_USERS)],
      schema: {
        description: 'Get all available roles and their permissions',
        tags: ['admin'],
        response: {
          200: {
            type: 'object',
            properties: {
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: { type: 'string' },
                    permissions: { type: 'array', items: { type: 'string' } },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const roles = await adminService.getRoles();
      return { roles };
    }
  );
};
