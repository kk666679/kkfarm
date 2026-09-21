# Architecture

- `skills/` defines capability contracts in markdown
- `references/` holds deep-dive docs referenced by skills
- `phonefarm/` is the Python implementation
- MCP tools are namespaced per domain: `phonefarm.{content,device,scheduler,fleet}.*`
- `phonefarm/utils/mcp_bridge.py` bootstraps the registry on process start
