package com.presstronic.kalsumed.events;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
@Component
public class EventProducer {
  private final KafkaTemplate<String, String> template;
  private final String topic;
  public EventProducer(KafkaTemplate<String,String> template, @Value("${kalsumed.kafka.topic:kalsumed.events}") String topic){
    this.template=template; this.topic=topic;
  }
  public void send(String key, String value){ template.send(topic, key, value); }
}
