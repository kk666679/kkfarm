import asyncio
from typing import Dict, Any


async def run(context: Dict[str, Any]) -> Dict[str, Any]:
    """Execute account warmup."""
    account_id = context.get("account_id")
    platform = context.get("platform", "tiktok")
    day = context.get("day", 1)

    if not account_id:
        return {"error": "account_id required"}

    warmup_schedule = {
        1: {"actions": ["browse_feed", "view_profiles"], "duration_min": 30},
        2: {"actions": ["browse_feed", "view_profiles", "like_posts"], "duration_min": 45},
        3: {"actions": ["browse_feed", "like_posts", "follow_users"], "duration_min": 60},
        4: {"actions": ["browse_feed", "like_posts", "follow_users", "comment"], "duration_min": 60},
        5: {"actions": ["browse_feed", "post_content", "like_posts", "follow_users"], "duration_min": 90},
        6: {"actions": ["browse_feed", "post_content", "engage"], "duration_min": 120},
        7: {"actions": ["full_activity"], "duration_min": 180},
    }

    schedule = warmup_schedule.get(min(day, 7), warmup_schedule[7])

    return {
        "success": True,
        "account_id": account_id,
        "day": day,
        "schedule": schedule,
        "platform": platform,
    }


if __name__ == "__main__":
    context = {"account_id": "acc_123", "platform": "tiktok", "day": 1}
    result = asyncio.run(run(context))
    print(result)