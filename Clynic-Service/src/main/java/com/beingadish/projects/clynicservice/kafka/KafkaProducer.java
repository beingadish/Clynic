package com.beingadish.projects.clynicservice.kafka;

import com.beingadish.projects.clynicservice.Model.Patient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import patient.events.PatientEvent;

@Service
public class KafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducer.class);
    // Defining the message type of Kafka Producer
    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    // Dependency Injection
    public KafkaProducer(KafkaTemplate<String, byte[]> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEvent(Patient patient) {
        PatientEvent patientEvent = PatientEvent.newBuilder()
                .setPatientId(patient.getId().toString())
                .setEmail(patient.getEmail())
                .setName(patient.getName())
                .setEventType("PATIENT_CREATED")
                .build();

        try {
            System.out.println("Sending Patient Event: " + patientEvent);
            System.out.println("Patient Id Type: " + patientEvent.getPatientId().getClass().getName());
            byte[] payload = patientEvent.toByteArray();
            System.out.println("Payload Type: " + payload.getClass().getName());
            kafkaTemplate.send("patient", payload);
        } catch (Exception e) {
            log.error("Error sending patient event: {}", patientEvent);
        }
    }

}
