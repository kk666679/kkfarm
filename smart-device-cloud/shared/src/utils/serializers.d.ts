import { Device, Task, Proxy, Application, User } from '..';
export declare function serializeDevice(device: Device): string;
export declare function deserializeDevice(json: string): Partial<Device>;
export declare function serializeTask(task: Task): string;
export declare function deserializeTask(json: string): Partial<Task>;
export declare function serializeProxy(proxy: Proxy): string;
export declare function deserializeProxy(json: string): Partial<Proxy>;
export declare function serializeApplication(app: Application): string;
export declare function deserializeApplication(json: string): Partial<Application>;
export declare function serializeUser(user: User): string;
export declare function deserializeUser(json: string): Partial<User>;
//# sourceMappingURL=serializers.d.ts.map
