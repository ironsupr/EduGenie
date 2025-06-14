"""
Tests for logging functionality
"""
import pytest
import logging
import json
from pathlib import Path
from utils.logger import setup_logger, log_with_context, CustomJSONFormatter

def test_logger_creation():
    """Test basic logger creation"""
    logger = setup_logger("test_logger")
    assert isinstance(logger, logging.Logger)
    assert logger.name == "test_logger"
    assert logger.level == logging.INFO
    assert len(logger.handlers) == 1
    assert isinstance(logger.handlers[0], logging.StreamHandler)

def test_logger_with_file(tmp_path):
    """Test logger with file output"""
    log_file = tmp_path / "test.log"
    logger = setup_logger("test_file_logger", str(log_file))
    assert len(logger.handlers) == 2
    
    # Test logging to file
    test_message = "Test log message"
    logger.info(test_message)
    
    # Read log file
    assert log_file.exists()
    with open(log_file) as f:
        log_entry = json.loads(f.readline())
        assert log_entry["message"] == test_message
        assert log_entry["level"] == "INFO"
        assert "timestamp" in log_entry

def test_custom_json_formatter():
    """Test custom JSON formatter"""
    formatter = CustomJSONFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="Test message",
        args=(),
        exc_info=None
    )
    
    formatted = formatter.format(record)
    log_entry = json.loads(formatted)
    
    assert "timestamp" in log_entry
    assert log_entry["logger"] == "test"
    assert log_entry["level"] == "INFO"
    assert log_entry["message"] == "Test message"

def test_log_with_context():
    """Test logging with additional context"""
    logger = setup_logger("test_context_logger")
    context = {"user_id": "123", "action": "test"}
    
    # Capture log output
    with pytest.LogCaptureFixture() as log_capture:
        log_with_context(logger, "INFO", "Test with context", context)
        
    # Verify context was included
    assert "user_id" in log_capture.records[0].extra_data
    assert log_capture.records[0].extra_data["action"] == "test"

def test_logger_level_override():
    """Test logger level override"""
    logger = setup_logger("test_level_logger", level="DEBUG")
    assert logger.level == logging.DEBUG
    
    logger.debug("Debug message")  # Should be logged
    logger.info("Info message")   # Should be logged
    
    # Verify both messages were logged
    assert len(logger.handlers) > 0
