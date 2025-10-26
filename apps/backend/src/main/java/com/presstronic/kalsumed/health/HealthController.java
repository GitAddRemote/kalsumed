package com.presstronic.kalsumed.health;
import com.presstronic.kalsumed.common.ApiMessage;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class HealthController {
  @GetMapping("/health/ping") public ApiMessage ping(){ return new ApiMessage("pong"); }
}
