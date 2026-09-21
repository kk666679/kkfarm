import { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema } from './schemas';
export const deviceValidation = {
  schema: DeviceSchema,
  parse: data => DeviceSchema.parse(data),
  safeParse: data => DeviceSchema.safeParse(data),
};
export { DeviceSchema, TaskSchema, ProxySchema, ApplicationSchema, UserSchema };
//# sourceMappingURL=device.schema.js.map
