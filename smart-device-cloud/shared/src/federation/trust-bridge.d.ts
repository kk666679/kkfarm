export type TrustLevel = 'full' | 'partial' | 'untrusted';
export interface TrustEntry {
  peerId: string;
  peerType: 'mcp' | 'acp' | 'service';
  trustLevel: TrustLevel;
  allowedScopes: string[];
  publicKeyJwks?: string;
  expiresAt?: string;
  createdAt: string;
}
export declare function establishTrust(
  entry: Omit<TrustEntry, 'createdAt'> & Partial<Pick<TrustEntry, 'createdAt'>>
): TrustEntry;
export declare function getTrust(peerId: string): TrustEntry | undefined;
export declare function isTrusted(peerId: string, minLevel?: TrustLevel): boolean;
export declare function hasScope(peerId: string, scope: string): boolean;
export declare function authorize(peerId: string, scopes: readonly string[]): boolean;
export declare function revokeTrust(peerId: string): boolean;
export declare function listTrustEntries(): TrustEntry[];
//# sourceMappingURL=trust-bridge.d.ts.map
