package com.beingadish.projects.analyticsservice.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import patient.events.PatientEvent;

@Service
public class KafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumer.class);

    // What to consume & Who is consuming
    @KafkaListener(topics = "patient", groupId = "analytics-service")
    public void consumeEvent(byte[] event) {
        try {
            PatientEvent patientEvent = PatientEvent.parseFrom(event);
            // ... can perform any kind of business logic here after receiving the
            // patientEvent from Kafka

            log.info("Received Patient Event: [Patient Id={}, Patient Name={}, PatientEmail={}]",
                    patientEvent.getPatientId(),
                    patientEvent.getName(),
                    patientEvent.getEmail());

        } catch (InvalidProtocolBufferException e) {
            log.error("Error Deserializing Patient Event {}", e.getMessage());
        }
    }
}
