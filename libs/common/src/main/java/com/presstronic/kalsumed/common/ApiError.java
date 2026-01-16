package com.presstronic.kalsumed.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Standardized error response format for all API errors.
 *
 * @param timestamp ISO-8601 timestamp when the error occurred
 * @param status HTTP status code
 * @param error HTTP status reason phrase
 * @param message Human-readable error message
 * @param path Request path that caused the error
 * @param errors Optional list of validation errors or additional error details
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<FieldError> errors
) {
    /**
     * Represents a validation error for a specific field.
     *
     * @param field Name of the field that failed validation
     * @param rejectedValue The value that was rejected
     * @param message Validation error message
     */
    public record FieldError(
        String field,
        Object rejectedValue,
        String message
    ) {}

    /**
     * Creates an ApiError without field errors.
     */
    public ApiError(Instant timestamp, int status, String error, String message, String path) {
        this(timestamp, status, error, message, path, null);
    }
}
