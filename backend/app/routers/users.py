from app.dependencies import UserDep
from app.schemas.users import UserUpdateSettings
from fastapi import Form
from fastapi import Request
from config import db_settings
from utils import TEMPLATE_DIR
from pydantic import EmailStr
from database.redis import add_jti_to_blacklist
from app.dependencies import get_user_access_token
from app.dependencies import get_current_user
from typing import Annotated
from services.userservice import UserService
from app.schemas.users import UserCreate
from app.schemas.users import UserRead
from fastapi import APIRouter, Depends
from app.dependencies import UserServiceDep
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates

user_router = APIRouter(prefix='/api/users', tags=['users'])

@user_router.post('/register', response_model=UserRead)
async def register_user(data: UserCreate, service: UserServiceDep):
    return await service.add_user(data)

@user_router.post('/token')
async def login_user(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep
):
    token = await service.token(
        request_form.username, request_form.password
    )
    return{
        "access_token":token,
        "token_type": "bearer"
    }

@user_router.get('/me', response_model=UserRead)
async def current_user(
    user: Annotated[dict, Depends(get_current_user)]
):
    return user

@user_router.patch("/me", response_model=UserRead)
async def update_me(data: UserUpdateSettings, user: UserDep, service: UserServiceDep):
    return await service.update_settings(user, data)
 

@user_router.post('/logout')
async def logout_user(token_data: Annotated[dict, Depends(get_user_access_token)]):
    await add_jti_to_blacklist(token_data["jti"])
    return{
        "detail":"Successfully logged out!!"
    }

@user_router.get('/verify')
async def verify_user_email(token:str, service: UserServiceDep):
    await service.verify_email(token)
    return {
        "detail":"Email verified successfully!"
    }

@user_router.get('/forgot-password')
async def forgot_password(email: EmailStr, service: UserServiceDep):
    await service.send_password_reset_link(email)
    return {"detail":"Check email for password reset link"}

@user_router.get('/reset_password_form')
async def get_reset_password_form(request:Request, token:str):
    templates = Jinja2Templates(TEMPLATE_DIR)

    return templates.TemplateResponse(
        request=request,
        name='password/reset.html',
        context={
            "reset_url": f"{db_settings.BASE_URL}/api/users/reset_password?token={token}"
        }
    )

@user_router.post("/reset_password")
async def reset_password(
    request: Request,
    token: str,
    password: Annotated[str, Form()],
    service: UserServiceDep,
):
    is_success = await service.reset_password(token, password)

    templates = Jinja2Templates(TEMPLATE_DIR)
    return templates.TemplateResponse(
        request=request,
        name="password/reset_success.html" if is_success else "password/reset_failed.html",
    )
