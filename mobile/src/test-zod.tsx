import { z } from 'zod';
const s = z.object({ meta: z.record(z.any()).optional() });
