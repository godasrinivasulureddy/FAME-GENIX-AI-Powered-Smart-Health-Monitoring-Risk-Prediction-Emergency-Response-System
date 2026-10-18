"""
Custom exceptions for FAME GENIX AI Service.
"""


class AIError(Exception):
    """Base exception for AI module errors."""
    pass


class AIConfigError(AIError):
    """Raised when Gemini API key or configuration is missing or invalid."""
    pass


class AIProviderError(AIError):
    """Raised when Gemini API returns an error or malformed response."""
    pass


class AITimeoutError(AIError):
    """Raised when Gemini API call times out."""
    pass
