from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError
from sqlalchemy.orm import Session

from app.core.exceptions import app_error
from app.core.security import decode_token
from app.db.models import User
from app.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise app_error("AUTH_REQUIRED", "Missing bearer token.")
    try:
        payload = decode_token(creds.credentials)
        if payload.get("type") != "access":
            raise app_error("AUTH_REQUIRED", "Invalid token type.")
    except PyJWTError:
        raise app_error("AUTH_REQUIRED", "Invalid or expired token.")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise app_error("AUTH_REQUIRED", "User no longer exists.")
    return user


def require_role(*roles: str):
    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise app_error("ACCESS_DENIED", f"Role {user.role} not permitted for this action.")
        return user

    return _checker
