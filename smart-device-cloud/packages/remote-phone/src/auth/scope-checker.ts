export class RemoteScopeChecker {
  check(scopes: readonly string[], required: readonly string[]): boolean {
    return required.every(scope => scopes.includes(scope) || scopes.includes('admin:all'));
  }

  assert(scopes: readonly string[], required: readonly string[]): void {
    if (!this.check(scopes, required))
      throw new Error(`Insufficient scopes: ${required.join(', ')}`);
  }
}
