package com.presstronic.kalsumed.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a rate limit is exceeded.
 * Results in HTTP 429 (Too Many Requests) response.
 */
public class RateLimitExceededException extends ApplicationException {

    public RateLimitExceededException(String message) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    public RateLimitExceededException() {
        super("Too many requests. Please try again later.", HttpStatus.TOO_MANY_REQUESTS);
    }
}
