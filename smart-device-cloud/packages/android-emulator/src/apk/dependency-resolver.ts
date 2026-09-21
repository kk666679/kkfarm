export interface ApkDependency {
  packageName: string;
  versionCode?: number;
  optional?: boolean;
}

export class ApkDependencyResolver {
  resolve(
    dependencies: readonly ApkDependency[],
    installed: ReadonlyMap<string, number> = new Map()
  ): { install: ApkDependency[]; missing: ApkDependency[] } {
    const missing = dependencies.filter(dependency => {
      const installedVersion = installed.get(dependency.packageName);
      return (
        installedVersion === undefined ||
        (dependency.versionCode !== undefined && installedVersion < dependency.versionCode)
      );
    });
    const optionalMissing = missing.filter(dependency => dependency.optional);
    return {
      install: missing.filter(dependency => !dependency.optional),
      missing: optionalMissing,
    };
  }

  topologicalOrder(dependencies: readonly ApkDependency[]): ApkDependency[] {
    const result: ApkDependency[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (dependency: ApkDependency): void => {
      if (visited.has(dependency.packageName)) return;
      if (visiting.has(dependency.packageName))
        throw new Error(`Circular APK dependency: ${dependency.packageName}`);
      visiting.add(dependency.packageName);
      visited.add(dependency.packageName);
      visiting.delete(dependency.packageName);
      result.push(dependency);
    };
    dependencies.forEach(visit);
    return result;
  }
}
