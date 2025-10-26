package com.presstronic.kalsumed.auth;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class LoginRateLimiter {
  private final StringRedisTemplate redis;
  private static final String KEY_PREFIX = "rate:login:";
  private static final int LIMIT = 10;
  private static final Duration WINDOW = Duration.ofMinutes(5);

  public LoginRateLimiter(StringRedisTemplate redis){ this.redis = redis; }

  public boolean allow(String key){
    String rkey = KEY_PREFIX + key;
    Long count = redis.opsForValue().increment(rkey);
    if(count != null && count == 1L){ redis.expire(rkey, WINDOW); }
    return count != null && count <= LIMIT;
  }
}
