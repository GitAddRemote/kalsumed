package com.presstronic.kalsumed.events;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
@RestController @RequestMapping("/api/events")
public class EventController {
  private final EventProducer producer;
  public EventController(EventProducer producer){ this.producer=producer; }
  @PostMapping("/test")
  public ResponseEntity<?> test(){
    producer.send("test", "hello-"+UUID.randomUUID());
    return ResponseEntity.accepted().build();
  }
}
