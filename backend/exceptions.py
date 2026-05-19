"""Custom exceptions"""


class StockNotFoundError(Exception):
    """Stock symbol not found"""
    pass


class DataFetchError(Exception):
    """Failed to fetch data"""
    pass


class APIRateLimitError(Exception):
    """API rate limit exceeded"""
    pass


class ValidationError(Exception):
    """Input validation error"""
    pass


class AIServiceError(Exception):
    """AI service error"""
    pass
