export class Scaffold {
  generate(spec) {
    return { ...spec, generatedAt: Date.now() };
  }
}
