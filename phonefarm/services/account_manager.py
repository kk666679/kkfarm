import asyncio
import uuid
from typing import Dict, Optional
from models.account_models import Account, AccountStatus
from agents.account.account_supervisor import AccountSupervisor


class AccountManager:
    def __init__(self):
        self.accounts: Dict[str, Account] = {}
        self.supervisors: Dict[str, AccountSupervisor] = {}

    def register_account(self, platform: str, username: str, credentials: Dict, policies: list = None) -> Account:
        account_id = str(uuid.uuid4())
        account = Account(
            account_id=account_id,
            platform=platform,
            username=username,
            credentials=credentials,
            policies=policies or []
        )
        self.accounts[account_id] = account
        self.supervisors[account_id] = AccountSupervisor()
        return account

    async def run_account_goal(self, account_id: str, goal: str) -> Dict:
        if account_id not in self.supervisors:
            raise ValueError(f"Account {account_id} not registered")
        supervisor = self.supervisors[account_id]
        account = self.accounts[account_id]
        result = await supervisor.process_account_goal(
            account_id=account_id,
            platform=account.platform,
            goal=goal
        )
        return result

    def get_account_status(self, account_id: str) -> Optional[Account]:
        return self.accounts.get(account_id)

    def update_account_policies(self, account_id: str, policies: list):
        if account_id in self.accounts:
            self.accounts[account_id].policies = policies


account_manager = AccountManager()
