import argparse
import asyncio
import sys
from config.autoclaw_loader import load_autoclaw_config
from services.auto_scheduler import start_scheduler
from services.account_manager import account_manager
from config.settings import settings

# August 2026 layers
from harness import PhoneFarmHarness, AgentConfig
from skills import SkillRegistry
from memory import WorkingSet
from governance import KillSwitch


def main():
    parser = argparse.ArgumentParser(description="Phone Farm Multi-Agent System (August 2026)")
    parser.add_argument('--config', default='.autoclaw.yaml', help='Path to .autoclaw file')
    parser.add_argument('--run-once', action='store_true', help='Execute immediately and exit')
    
    # August 2026 subcommands
    subparsers = parser.add_subparsers(dest='command', help='August 2026 commands')

    # Harness command
    harness_parser = subparsers.add_parser('harness', help='Run agent via harness')
    harness_parser.add_argument('--agent-id', required=True, help='Agent ID')
    harness_parser.add_argument('--goal', required=True, help='Goal to execute')

    # Skills commands
    skills_parser = subparsers.add_parser('skills', help='Manage skills')
    skills_subparsers = skills_parser.add_subparsers(dest='skills_command')
    skills_subparsers.add_parser('list', help='List all skills (L1)')
    skill_get = skills_subparsers.add_parser('get', help='Get skill body (L2)')
    skill_get.add_argument('skill_name', help='Skill name')
    skill_resource = skills_subparsers.add_parser('resource', help='Get skill resource (L3)')
    skill_resource.add_argument('skill_name', help='Skill name')
    skill_resource.add_argument('resource', help='Resource name')

    # Memory commands
    memory_parser = subparsers.add_parser('memory', help='Memory operations')
    memory_subparsers = memory_parser.add_subparsers(dest='memory_command')
    memory_subparsers.add_parser('stm', help='Show STM entries')
    memory_search = memory_subparsers.add_parser('search', help='Search memory')
    memory_search.add_argument('query', help='Search query')

    # Governance commands
    gov_parser = subparsers.add_parser('governance', help='Governance operations')
    gov_subparsers = gov_parser.add_subparsers(dest='governance_command')
    gov_subparsers.add_parser('cost', help='Show cost usage')
    gov_subparsers.add_parser('kill-switch-status', help='Show kill switch status')
    gov_activate = gov_subparsers.add_parser('activate-kill-switch', help='Activate kill switch')
    gov_activate.add_argument('reason', help='Reason for activation')
    gov_subparsers.add_parser('deactivate-kill-switch', help='Deactivate kill switch')

    # MCP command
    mcp_parser = subparsers.add_parser('mcp', help='Start MCP server')
    mcp_parser.add_argument('--host', default=settings.MCP_HOST, help='Host')
    mcp_parser.add_argument('--port', type=int, default=settings.MCP_PORT, help='Port')

    args = parser.parse_args()

    config = load_autoclaw_config(args.config)

    # Handle August 2026 commands
    if args.command == 'harness':
        return run_harness(args)
    elif args.command == 'skills':
        return run_skills(args)
    elif args.command == 'memory':
        return run_memory(args)
    elif args.command == 'governance':
        return run_governance(args)
    elif args.command == 'mcp':
        return run_mcp(args)

    # Legacy commands
    if args.run_once:
        for entry in config.get('schedule', []):
            asyncio.run(account_manager.run_account_goal(
                account_id=entry['account_id'],
                goal=entry['goal']
            ))
    else:
        start_scheduler()
        try:
            asyncio.get_event_loop().run_forever()
        except KeyboardInterrupt:
            pass


async def run_harness(args):
    """Run agent via harness."""
    agent_config = AgentConfig(
        id=args.agent_id,
        system_prompt="You are a phone farm agent.",
        tools=[],
        guardrails=[],
    )
    harness = PhoneFarmHarness(agent_config)
    result = await harness.run(args.goal)
    print(f"Result: {result}")


def run_skills(args):
    """Skill management."""
    registry = SkillRegistry()
    registry.discover()

    if args.skills_command == 'list':
        skills = registry.load_metadata()
        for skill in skills:
            print(f"- {skill['name']}: {skill['description']}")
    elif args.skills_command == 'get':
        body = registry.load_body(args.skill_name)
        if body:
            print(f"Skill: {args.skill_name}")
            print(f"Description: {body.description}")
            print(f"Procedure: {body.procedure}")
        else:
            print(f"Skill not found: {args.skill_name}")
            sys.exit(1)
    elif args.skills_command == 'resource':
        resource = registry.load_resource(args.skill_name, args.resource)
        if resource is not None:
            print(resource)
        else:
            print(f"Resource not found: {args.skill_name}/{args.resource}")
            sys.exit(1)


def run_memory(args):
    """Memory operations."""
    stm = WorkingSet()

    if args.memory_command == 'stm':
        entries = stm.get_recent(20)
        for entry in entries:
            print(f"[{entry.salience:.2f}] {entry.content}")
    elif args.memory_command == 'search':
        results = stm.search(args.query, limit=10)
        for entry in results:
            print(f"[{entry.salience:.2f}] {entry.content}")


def run_governance(args):
    """Governance operations."""
    if args.governance_command == 'cost':
        usage = cost_ceiling.get_usage()
        for agent_id, cost in usage.items():
            print(f"{agent_id}: ${cost:.4f}")
    elif args.governance_command == 'kill-switch-status':
        state = KillSwitch.get_state()
        print(f"Active: {state.active}")
        if state.active:
            print(f"Reason: {state.reason}")
            print(f"Activated: {state.activated_at}")
    elif args.governance_command == 'activate-kill-switch':
        KillSwitch.activate(args.reason, "cli")
        print(f"Kill switch activated: {args.reason}")
    elif args.governance_command == 'deactivate-kill-switch':
        KillSwitch.deactivate("cli")
        print("Kill switch deactivated")


def run_mcp(args):
    """Start MCP server."""
    from mcp import run_server
    print(f"Starting MCP server on {args.host}:{args.port} (stateless)")
    run_server(host=args.host, port=args.port)


if __name__ == '__main__':
    main()