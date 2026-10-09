# routers/push.py
from app.schemas.push import PushUnsubscribeRequest
from app.dependencies import PushSubscriptionServiceDep
from app.dependencies import UserDep
from fastapi import APIRouter
from app.schemas.push import PushSubscribeRequest

push_router = APIRouter(prefix='/api/push', tags=['push'])

@push_router.post('/subscribe')
async def subscribe(data: PushSubscribeRequest, user: UserDep, service: PushSubscriptionServiceDep):
    await service.subscribe(user.id, data)
    return{"details":"Subscribed!!"}

@push_router.post("/unsubscribe")
async def unsubscribe(data: PushUnsubscribeRequest, user: UserDep, service: PushSubscriptionServiceDep):
    await service.unsubscribe(user.id, data.endpoint)
    return {"detail": "Unsubscribed"}