package com.presstronic.kalsumed.events;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {
  @Bean
  public NewTopic kalsumedTopic(@Value("${kalsumed.kafka.topic:kalsumed.events}") String topic){
    return TopicBuilder.name(topic).partitions(1).replicas(1).build();
  }
}
