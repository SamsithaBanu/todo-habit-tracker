# core/timezone_utils.py
from datetime import date
import pytz
from zoneinfo import ZoneInfo
from datetime import datetime, timezone as dt_timezone

def is_local_time(user_timezone:str, target:str) ->bool:
    """target format: 'HH:MM', eg. '00:00' """
    now_local = datetime.now(ZoneInfo(user_timezone))
    return now_local.strftime("%H:%M") == target

def get_user_local_date(user_timezone: str) -> date:
    return datetime.now(ZoneInfo(user_timezone)).date()

def get_user_local_weekday(user_timezone: str) -> int:
    """ISO weekday: 1=Mon .. 7=Sun"""
    return datetime.now(ZoneInfo(user_timezone)).isoweekday()