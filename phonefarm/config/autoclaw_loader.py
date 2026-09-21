import os
import re
import yaml
from pathlib import Path
from models.account_models import AccountPlatform
from services.account_manager import account_manager
from services.auto_scheduler import schedule_goal


def _substitute_env_vars(value):
    if isinstance(value, dict):
        return {k: _substitute_env_vars(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_substitute_env_vars(v) for v in value]
    if isinstance(value, str):
        pattern = re.compile(r"\$\{([^}]+)\}")
        def replacer(match):
            env_key = match.group(1)
            return os.getenv(env_key, match.group(0))
        return pattern.sub(replacer, value)
    return value


def load_autoclaw_config(file_path: str = ".autoclaw.yaml"):
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"No config file found at {path.absolute()}")

    with open(path, 'r') as f:
        config = yaml.safe_load(f)

    config = _substitute_env_vars(config)

    account_id_map = {}
    for acc_data in config.get('accounts', []):
        raw_platform = acc_data['platform']
        try:
            platform = AccountPlatform(raw_platform)
        except ValueError:
            platform = AccountPlatform.CUSTOM

        account = account_manager.register_account(
            platform=platform.value,
            username=acc_data['username'],
            credentials=acc_data.get('credentials', {}),
            policies=acc_data.get('policies', [])
        )
        account_id_map[acc_data['username']] = account.account_id
        print(f"Registered account: {account.account_id} ({account.platform})")

    schedule = config.get('schedule', [])
    resolved_schedule = []
    for entry in schedule:
        account_id = entry.get('account_id')
        if account_id in account_id_map:
            account_id = account_id_map[account_id]
        resolved_schedule.append({
            'account_id': account_id,
            'goal': entry['goal'],
            'cron': entry['cron']
        })
        schedule_goal(account_id, entry['goal'], entry['cron'])

    return {
        "farm": config.get('farm', {}),
        "accounts": list(account_manager.accounts.keys()),
        "schedule": resolved_schedule,
        "webhooks": config.get('webhooks', {}),
        "knowledge_base": config.get('knowledge_base', {})
    }
