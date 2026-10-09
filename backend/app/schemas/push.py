# app/schemas/push.py
from pydantic import BaseModel

class PushSubscribeRequest(BaseModel):
    endpoint: str
    auth: str
    p256dh: str

class PushUnsubscribeRequest(BaseModel):
    endpoint: str