export interface Claims {
  sub: string;
  role: string;
  tenant_id: string;
  scope: string;
  exp: number;
  iat: number;
}
