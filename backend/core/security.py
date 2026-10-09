from fastapi.security import OAuth2PasswordBearer

oauth2_scheme_user = OAuth2PasswordBearer(tokenUrl='/api/users/token')

