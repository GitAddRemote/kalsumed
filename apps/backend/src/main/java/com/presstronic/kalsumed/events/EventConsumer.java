package com.presstronic.kalsumed.events;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class EventConsumer {
  private static final Logger log = LoggerFactory.getLogger(EventConsumer.class);
  @KafkaListener(topics = "${kalsumed.kafka.topic:kalsumed.events}", groupId = "kalsumed-dev")
  public void onMessage(ConsumerRecord<String,String> rec){
    log.info("Consumed event key={} value={}", rec.key(), rec.value());
  }
}
