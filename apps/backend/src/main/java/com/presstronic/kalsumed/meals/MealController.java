package com.presstronic.kalsumed.meals;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List; import java.util.Map;
@RestController @RequestMapping("/api/meals")
public class MealController {
  @GetMapping public ResponseEntity<List<Map<String,Object>>> list(){ return ResponseEntity.ok(List.of()); }
}
