from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code


ERROR_STATUS = {
    "VALIDATION_ERROR": 400,
    "AUTH_REQUIRED": 401,
    "INVALID_CREDENTIALS": 401,
    "ACCESS_DENIED": 403,
    "PATIENT_NOT_FOUND": 404,
    "USER_NOT_FOUND": 404,
    "DEVICE_NOT_CONNECTED": 409,
    "INVALID_MEASUREMENT": 400,
    "ASSESSMENT_INCOMPLETE": 409,
    "CONSENT_REQUIRED": 403,
    "EMERGENCY_CASE_NOT_FOUND": 404,
    "SIMULATION_ONLY": 400,
    "MODEL_UNAVAILABLE": 503,
    "INVALID_STATE_TRANSITION": 409,
    "ALREADY_EXISTS": 409,
    "NOT_FOUND": 404,
}


def app_error(code: str, message: str) -> AppError:
    return AppError(code, message, ERROR_STATUS.get(code, 400))


async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"data": None, "error": {"code": exc.code, "message": exc.message}},
    )
