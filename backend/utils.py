from itsdangerous import SignatureExpired, BadSignature, URLSafeTimedSerializer
from config import security_settings
from datetime import datetime, timedelta, timezone
import jwt
from uuid import uuid4 
from pathlib import Path

_serializer = URLSafeTimedSerializer(secret_key=security_settings.JWT_SECRET)

APP_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = APP_DIR/"templates"

def generate_access_token(
    data:dict,
    expiry: timedelta = timedelta(days=10)
)->str :
    payload={
        **data,
        "jti":str(uuid4()),
        "exp": datetime.now(timezone.utc) + expiry,
    }
    return jwt.encode(
        payload=payload,
        key=security_settings.JWT_SECRET,
        algorithm=security_settings.JWT_ALGORITHM
    )

def decode_access_token(token:str)->dict |None:
    try:
        return jwt.decode(
            jwt=token,
            key=security_settings.JWT_SECRET,
            algorithms=[security_settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        return None

def generate_url_safe_token(data:dict, salt:str | None =None)->str:
    return _serializer.dumps(data, salt=salt)

def decode_url_safe_token(
    token:str,
    salt:str | None = None,
    expiry: timedelta | None = None
) ->dict | None:
    try:
        return _serializer.loads(
            token,
            salt=salt,
            max_age=expiry.total_seconds() if expiry else None,
        )
    except(BadSignature, SignatureExpired):
        return None