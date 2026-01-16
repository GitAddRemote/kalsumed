package com.presstronic.kalsumed.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception class for all application-specific exceptions.
 * Provides consistent structure for error handling across the application.
 */
public class ApplicationException extends RuntimeException {

    private final HttpStatus status;

    public ApplicationException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public ApplicationException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
