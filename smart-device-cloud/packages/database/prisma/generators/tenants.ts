export const TENANT_SEEDS = [
  {
    slug: 'demo',
    name: 'Demo Corp',
    plan: 'GROWTH' as const,
    status: 'ACTIVE' as const,
    users: [
      { email: 'owner@demo.test',     role: 'OWNER'         as const },
      { email: 'admin@demo.test',     role: 'ADMINISTRATOR' as const },
      { email: 'operator@demo.test',  role: 'OPERATOR'      as const },
      { email: 'developer@demo.test', role: 'DEVELOPER'     as const },
      { email: 'viewer@demo.test',    role: 'VIEWER'        as const },
    ],
  },
  {
    slug: 'acme',
    name: 'Acme Labs',
    plan: 'STARTER' as const,
    status: 'TRIAL' as const,
    users: [{ email: 'owner@acme.test', role: 'OWNER' as const }],
  },
]