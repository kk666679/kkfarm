import { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema } from './schemas';
export declare const deviceValidation: {
  schema: import('zod').ZodObject<
    {
      id: import('zod').ZodString;
      name: import('zod').ZodString;
      provider: import('zod').ZodString;
      serial: import('zod').ZodOptional<import('zod').ZodString>;
      androidVersion: import('zod').ZodOptional<import('zod').ZodString>;
      apiLevel: import('zod').ZodOptional<import('zod').ZodNumber>;
      status: import('zod').ZodEnum<{
        offline: 'offline';
        starting: 'starting';
        online: 'online';
        busy: 'busy';
        error: 'error';
        stopping: 'stopping';
      }>;
      containerId: import('zod').ZodOptional<import('zod').ZodString>;
      adbHost: import('zod').ZodOptional<import('zod').ZodIPv4>;
      adbPort: import('zod').ZodOptional<import('zod').ZodNumber>;
      assignedTaskId: import('zod').ZodOptional<import('zod').ZodString>;
      lastHeartbeat: import('zod').ZodOptional<import('zod').ZodString>;
      createdAt: import('zod').ZodString;
      updatedAt: import('zod').ZodString;
      capabilities: import('zod').ZodOptional<import('zod').ZodArray<import('zod').ZodString>>;
      ipAddress: import('zod').ZodOptional<import('zod').ZodIPv4>;
    },
    import('zod/v4/core').$strip
  >;
  parse: (data: unknown) => {
    id: string;
    name: string;
    provider: string;
    status: 'offline' | 'starting' | 'online' | 'busy' | 'error' | 'stopping';
    createdAt: string;
    updatedAt: string;
    serial?: string | undefined;
    androidVersion?: string | undefined;
    apiLevel?: number | undefined;
    containerId?: string | undefined;
    adbHost?: string | undefined;
    adbPort?: number | undefined;
    assignedTaskId?: string | undefined;
    lastHeartbeat?: string | undefined;
    capabilities?: string[] | undefined;
    ipAddress?: string | undefined;
  };
  safeParse: (data: unknown) => import('zod').ZodSafeParseResult<{
    id: string;
    name: string;
    provider: string;
    status: 'offline' | 'starting' | 'online' | 'busy' | 'error' | 'stopping';
    createdAt: string;
    updatedAt: string;
    serial?: string | undefined;
    androidVersion?: string | undefined;
    apiLevel?: number | undefined;
    containerId?: string | undefined;
    adbHost?: string | undefined;
    adbPort?: number | undefined;
    assignedTaskId?: string | undefined;
    lastHeartbeat?: string | undefined;
    capabilities?: string[] | undefined;
    ipAddress?: string | undefined;
  }>;
};
export { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema };
//# sourceMappingURL=device.schema.d.ts.map
