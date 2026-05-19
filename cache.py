"""Caching utilities"""
import json
from datetime import datetime, timedelta
from typing import Any, Optional


class SimpleCache:
    """Simple in-memory cache with TTL"""
    
    def __init__(self):
        self._cache = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key not in self._cache:
            return None
        
        value, expiry = self._cache[key]
        if datetime.now() > expiry:
            del self._cache[key]
            return None
        
        return value
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Set value in cache with TTL"""
        expiry = datetime.now() + timedelta(seconds=ttl_seconds)
        self._cache[key] = (value, expiry)
    
    def clear(self, key: Optional[str] = None):
        """Clear cache"""
        if key:
            self._cache.pop(key, None)
        else:
            self._cache.clear()
    
    def get_size(self) -> int:
        """Get cache size"""
        return len(self._cache)


# Global cache instance
cache = SimpleCache()


def serialize_analysis(data: dict) -> str:
    """Serialize analysis data for caching"""
    return json.dumps(data, default=str)


def deserialize_analysis(data: str) -> dict:
    """Deserialize analysis data from cache"""
    return json.loads(data)
