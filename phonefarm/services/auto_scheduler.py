from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.account_manager import account_manager
import logging

scheduler = AsyncIOScheduler()
logger = logging.getLogger(__name__)


def schedule_goal(account_id: str, goal: str, cron_expr: str):
    def job():
        asyncio.create_task(account_manager.run_account_goal(account_id, goal))

    trigger = CronTrigger.from_crontab(cron_expr)
    scheduler.add_job(job, trigger=trigger, id=f"{account_id}_{goal}", replace_existing=True)
    logger.info(f"Scheduled goal '{goal}' for account {account_id} at {cron_expr}")


def start_scheduler():
    scheduler.start()
