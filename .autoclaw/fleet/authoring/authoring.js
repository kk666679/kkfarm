export class Authoring {
  scaffold(template) {
    return { ...template, scaffoldedAt: Date.now() };
  }
}
