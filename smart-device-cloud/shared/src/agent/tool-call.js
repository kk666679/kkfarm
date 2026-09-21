export const createToolRegistry = () => {
  const tools = new Map();
  return {
    register(tool) {
      tools.set(tool.name, tool);
    },
    get(name) {
      return tools.get(name);
    },
    list() {
      return Array.from(tools.values());
    },
    async execute(name, input) {
      const tool = tools.get(name);
      if (!tool) {
        return { success: false, error: `Tool not found: ${name}` };
      }
      try {
        return await tool.handler(input);
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
};
//# sourceMappingURL=tool-call.js.map
