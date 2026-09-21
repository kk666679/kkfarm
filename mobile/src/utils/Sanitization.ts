const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'session',
  'creditCard',
  'ssn',
];

export const sanitizeForLogging = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }

  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = sanitizeForLogging(obj[key]);
    }
  }
  return sanitized;
};

export const sanitizeString = (str: string): string => {
  let sanitized = str;
  SENSITIVE_KEYS.forEach(key => {
    const regex = new RegExp(`(${key}\\s*[:=]\\s*)[^&\\s,}]+`, 'gi');
    sanitized = sanitized.replace(regex, '$1***REDACTED***');
  });
  return sanitized;
};

export default { sanitizeForLogging, sanitizeString };
