import { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema } from './schemas';

export const deviceValidation = {
  schema: DeviceSchema,
  parse: (data: unknown) => DeviceSchema.parse(data),
  safeParse: (data: unknown) => DeviceSchema.safeParse(data),
};

export { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema };
