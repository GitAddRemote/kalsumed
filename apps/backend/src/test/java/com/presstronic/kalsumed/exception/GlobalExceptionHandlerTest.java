package com.presstronic.kalsumed.exception;

import com.presstronic.kalsumed.auth.AuthDtos;
import com.presstronic.kalsumed.auth.UserEntity;
import com.presstronic.kalsumed.auth.UserRepository;
import com.presstronic.kalsumed.tenant.TenantEntity;
import com.presstronic.kalsumed.tenant.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for global exception handling.
 * Tests that errors are properly caught and returned with structured ApiError responses.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private TenantEntity defaultTenant;

    @BeforeEach
    void setUp() {
        // Ensure default tenant exists
        defaultTenant = tenantRepository.findBySlug("default")
                .orElseGet(() -> tenantRepository.save(new TenantEntity("default", "Default Tenant")));

        // Clean up test users
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should return 400 with field errors for invalid registration data")
    void testValidationErrors() throws Exception {
        String invalidRequest = """
                {
                    "email": "not-an-email",
                    "password": ""
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"))
                .andExpect(jsonPath("$.path").value("/api/auth/register"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("Should return 422 when registering with duplicate email")
    void testDuplicateEmailError() throws Exception {
        // Create existing user
        UserEntity existingUser = new UserEntity(
                defaultTenant,
                "test@example.com",
                passwordEncoder.encode("password123")
        );
        userRepository.save(existingUser);

        String request = """
                {
                    "email": "test@example.com",
                    "password": "newpassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.error").value("Unprocessable Entity"))
                .andExpect(jsonPath("$.message").value("Email is already registered"))
                .andExpect(jsonPath("$.path").value("/api/auth/register"));
    }

    @Test
    @DisplayName("Should return 401 for invalid credentials")
    void testInvalidCredentials() throws Exception {
        // Create user
        UserEntity user = new UserEntity(
                defaultTenant,
                "user@example.com",
                passwordEncoder.encode("correctpassword")
        );
        userRepository.save(user);

        String request = """
                {
                    "email": "user@example.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    @DisplayName("Should return 401 when accessing protected endpoint without token")
    void testMissingAuthentication() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Authentication required. Please provide a valid token."))
                .andExpect(jsonPath("$.path").value("/api/me"));
    }

    @Test
    @DisplayName("Should return 401 for invalid JWT token")
    void testInvalidToken() throws Exception {
        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Should return 400 for malformed JSON")
    void testMalformedJson() throws Exception {
        String malformedJson = "{invalid json}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Malformed JSON request. Please check your request body."))
                .andExpect(jsonPath("$.path").value("/api/auth/register"));
    }

    @Test
    @DisplayName("Should return structured error for rate limiting")
    void testRateLimitError() throws Exception {
        // Create user for login attempts
        UserEntity user = new UserEntity(
                defaultTenant,
                "ratelimit@example.com",
                passwordEncoder.encode("password123")
        );
        userRepository.save(user);

        String loginRequest = """
                {
                    "email": "ratelimit@example.com",
                    "password": "wrongpassword"
                }
                """;

        // Make multiple failed login attempts to trigger rate limit (11 attempts)
        for (int i = 0; i < 11; i++) {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(loginRequest));
        }

        // The 12th attempt should be rate limited
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error").value("Too Many Requests"))
                .andExpect(jsonPath("$.message", containsString("too many")))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }
}
