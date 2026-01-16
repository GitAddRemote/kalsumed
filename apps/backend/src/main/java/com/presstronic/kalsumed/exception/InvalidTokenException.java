package com.presstronic.kalsumed.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when JWT token is invalid, expired, or malformed.
 * Results in HTTP 401 (Unauthorized) response.
 */
public class InvalidTokenException extends ApplicationException {

    public InvalidTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, HttpStatus.UNAUTHORIZED, cause);
    }
}
