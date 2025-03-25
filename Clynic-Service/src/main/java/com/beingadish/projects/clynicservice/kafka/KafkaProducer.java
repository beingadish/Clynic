package com.beingadish.projects.clynicservice.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {

    // Defining the message type of Kafka Producer
    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    // Dependency Injection
    public KafkaProducer(KafkaTemplate<String, byte[]> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }





}
