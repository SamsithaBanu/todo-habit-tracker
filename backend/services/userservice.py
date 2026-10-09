from datetime import timedelta
from uuid import UUID
from utils import decode_url_safe_token
from config import db_settings
from services.notifications import NotificationService
from fastapi import BackgroundTasks
from utils import generate_url_safe_token
from utils import generate_access_token
from database.models import PETS
from app.schemas.users import UserCreate, UserUpdateSettings
from database.models import USERSS
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
import asyncio
from sqlalchemy import select
from fastapi import HTTPException, status


def hash_password(password:str)->str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password:str, password_hash:str)->bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False

class UserService:
    def __init__(self, session:AsyncSession, tasks: BackgroundTasks):
        self.model = USERSS
        self.session=session
        self.notification_service = NotificationService(tasks)

    async def add_user(self, data: UserCreate) -> USERSS:
        existing_user = await self._get_by_email(data.email)

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        password_hash = await asyncio.to_thread(hash_password, data.password)

        user = self.model(
            name=data.name,
            email=data.email,
            password_hash=password_hash,
            timezone=data.timezone,
        )
        self.session.add(user)
        await self.session.flush()   # assigns user.id without committing yet

        pet = PETS(
            user_id=user.id,
            species=data.pet_species,
            nickname=data.pet_nickname,
        )
        self.session.add(pet)

        await self.session.commit()
        await self.session.refresh(user)

        token = generate_url_safe_token({
            "id" : str(user.id)
        })
        
        await self.notification_service.send_email_with_template(
            recipients=[user.email],
            subject="Verify your email",
            template_name="mail_email_verify.html",
            context={
                "username":user.name,
                "verification_url":f"{db_settings.BASE_URL}/api/users/verify?token={token}"
            },
        )

        return user
    
    async def _get_by_email(self, email:str)->USERSS |None:
        return await self.session.scalar(
            select(self.model).where(self.model.email == email)
        )

    async def token(self, email:str, password:str)->str:
        user = await self._get_by_email(email)

        if user is None or not await asyncio.to_thread(
            verify_password, password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email or password id incorrect"
            )

        return generate_access_token(
            data={
                "user":{
                    "name":user.name,
                    "id":str(user.id)
                }
            }
        )
    async def verify_email(self, token:str):
        token_data = decode_url_safe_token(token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='invalid or expired token'
            )
        user = await self.session.get(self.model, UUID(token_data["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        user.is_verified = True

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
    
    async def send_password_reset_link(self, email):
        user = await self._get_by_email(email)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email does not exist"
            )

        token = generate_url_safe_token({"id": str(user.id)}, salt="password-reset")

        await self.notification_service.send_email_with_template(
            recipients=[user.email],
            subject="FastShip Account Password Reset",
            context={
                "username": user.name,
                "reset_url": f"{db_settings.BASE_URL}/api/users/reset_password_form?token={token}",
            },
            template_name="mail_password_reset.html",
        )
    
    async def reset_password(self, token: str, password: str) -> bool:
        token_data = decode_url_safe_token(
            token,
            salt="password-reset",
            expiry=timedelta(days=1),
        )

        if not token_data:
            return False

        user = await self.session.get(self.model, UUID(token_data["id"]))
        if not user:
            return False
        user.password_hash = await asyncio.to_thread(hash_password, password)

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return True

    async def get_me(self, user: USERSS) -> USERSS:
        # UserDep (your get_current_user dependency) already fetched this row —
        # nothing more to query, just hand it back.
        return user

    async def update_settings(self, user: USERSS, data: UserUpdateSettings) -> USERSS:
        if data.reminder_morning_time is not None:
            user.reminder_morning_time = data.reminder_morning_time

        if data.reminder_evening_time is not None:
            user.reminder_evening_time = data.reminder_evening_time

        if data.timezone is not None:
            user.timezone = data.timezone

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return user