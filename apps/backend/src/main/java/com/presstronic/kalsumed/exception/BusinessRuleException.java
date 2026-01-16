package com.presstronic.kalsumed.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a business rule is violated.
 * Results in HTTP 422 (Unprocessable Entity) response.
 */
public class BusinessRuleException extends ApplicationException {

    public BusinessRuleException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public BusinessRuleException(String message, Throwable cause) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, cause);
    }
}
