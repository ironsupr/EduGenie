"""
Logging configuration for the application
"""
import logging
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from core.config import settings

class CustomJSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "logger": record.name,
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        # Add extra fields if present
        if hasattr(record, "extra_data"):
            log_obj["extra"] = record.extra_data
            
        return json.dumps(log_obj)

def setup_logger(
    name: str = __name__,
    log_file: Optional[str] = None,
    level: str = None
) -> logging.Logger:
    """
    Configure and return a logger instance with consistent formatting
    Args:
        name: Logger name (default: module name)
        log_file: Optional file path for logging
        level: Optional log level override
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        # Set log level from settings or parameter
        log_level = getattr(logging, level or settings.LOG_LEVEL)
        logger.setLevel(log_level)
        
        # Console handler with JSON formatting
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(CustomJSONFormatter())
        logger.addHandler(console_handler)
        
        # File handler if specified
        if log_file:
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(CustomJSONFormatter())
            logger.addHandler(file_handler)
        
        # Prevent propagation to root logger
        logger.propagate = False
    
    return logger

def log_with_context(
    logger: logging.Logger,
    level: str,
    message: str,
    context: Dict[str, Any] = None
) -> None:
    """
    Log a message with additional context
    Args:
        logger: Logger instance
        level: Log level (INFO, ERROR, etc.)
        message: Log message
        context: Additional context dictionary
    """
    extra = {"extra_data": context} if context else {}
    
    log_method = getattr(logger, level.lower())
    log_method(message, extra=extra)
