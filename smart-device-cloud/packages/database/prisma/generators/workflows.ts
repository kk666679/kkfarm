export async function seedWorkflows(prisma: any, tenantId: string) {
  const templates = [
    {
      name: 'Daily App Health Sweep',
      description: 'Open the app, login, screenshot, close.',
      nodes: [
        { id: 't1', kind: 'TRIGGER', name: 'Schedule', config: { cron: '0 6 * * *' } },
        { id: 'a1', kind: 'ACTION',  name: 'openApp',  config: { pkg: 'com.shop.app' } },
        { id: 'a2', kind: 'ACTION',  name: 'typeText', config: { selector: '#user', text: 'demo' } },
        { id: 'a3', kind: 'ACTION',  name: 'tap',      config: { selector: '#login' } },
        { id: 'a4', kind: 'ACTION',  name: 'screenshot', config: { label: 'post-login' } },
        { id: 'e1', kind: 'END',     name: 'Done' },
      ],
      edges: [
        { from: 't1', to: 'a1' }, { from: 'a1', to: 'a2' },
        { from: 'a2', to: 'a3' }, { from: 'a3', to: 'a4' },
        { from: 'a4', to: 'e1' },
      ],
    },
    {
      name: 'Nightly Regression',
      description: 'Full regression across all devices.',
      nodes: [
        { id: 't1', kind: 'TRIGGER', name: 'Manual', config: {} },
        { id: 'a1', kind: 'ACTION',  name: 'installApk', config: { url: 's3://…' } },
        { id: 'a2', kind: 'ACTION',  name: 'runSuite',   config: { suite: 'regression' } },
        { id: 'e1', kind: 'END',     name: 'Done' },
      ],
      edges: [{ from: 't1', to: 'a1' }, { from: 'a1', to: 'a2' }, { from: 'a2', to: 'e1' }],
    },
  ]

  for (const w of templates) {
    await prisma.workflow.upsert({
      where: { tenantId_name: { tenantId, name: w.name } },
      create: { tenantId, status: 'ACTIVE', ...w },
      update: {},
    })
  }
}