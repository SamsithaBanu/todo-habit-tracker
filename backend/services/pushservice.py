from config import db_settings
from pydantic_settings.sources.providers import json
from uuid import UUID
from sqlalchemy import select
from database.models import PUSH_SUBSCRIPTIONS
from app.schemas.push import PushSubscribeRequest
from sqlalchemy.ext.asyncio import AsyncSession
from pywebpush import webpush, WebPushException

class PushService:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def subscribe(self, user_id: UUID, data: PushSubscribeRequest) -> None:
        existing = await self.session.scalar(
            select(PUSH_SUBSCRIPTIONS).where(PUSH_SUBSCRIPTIONS.endpoint == data.endpoint)
        )
        if existing:
            return
        sub = PUSH_SUBSCRIPTIONS(user_id=user_id, endpoint=data.endpoint, p256dh=data.p256dh, auth=data.auth)
        self.session.add(sub)
        await self.session.commit()
        await self.session.refresh(sub)
    
    async def send_to_user(self, user_id: UUID, title: str, body: str) ->None:
        result = await self.session.execute(
            select(PUSH_SUBSCRIPTIONS).where(PUSH_SUBSCRIPTIONS.user_id == user_id)
        )
        subs = result.scalars().all()

        for sub in subs:
            try:
                webpush(
                    subscription_info = {
                        "endpoint":sub.endpoint,
                        "keys":{
                            "p256dh": sub.p256dh,
                            "auth":sub.auth
                        }
                    },
                    data = json.dumps({"title":title, "body":body}),
                    vapid_private_key = db_settings.VAPID_PRIVATE_KEY,
                    vapid_claims=db_settings.VAPID_CLAIM_EMAIL
                )
            
            except WebPushException as e:
                if e.response is not None and e.response.status_code == 410:
                    # 410 Gone = subscription expired/revoked, safe to delete
                    await self.session.delete(sub)
                    await self.session.commit()

    async def unsubscribe(self, user_id: UUID, endpoint: str) -> None:
        sub = await self.session.scalar(
            select(PUSH_SUBSCRIPTIONS).where(
                PUSH_SUBSCRIPTIONS.user_id == user_id,
                PUSH_SUBSCRIPTIONS.endpoint == endpoint,
            )
        )
        if sub:
            await self.session.delete(sub)
            await self.session.commit()