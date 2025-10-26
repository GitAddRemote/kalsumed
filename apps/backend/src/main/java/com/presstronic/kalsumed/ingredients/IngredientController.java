package com.presstronic.kalsumed.ingredients;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List; import java.util.Map;
@RestController @RequestMapping("/api/ingredients")
public class IngredientController {
  @GetMapping public ResponseEntity<List<Map<String,Object>>> list(){ return ResponseEntity.ok(List.of()); }
}
