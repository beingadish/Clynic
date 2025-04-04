package com.beingadish.projects.clynicservice.Controller;

import com.beingadish.projects.clynicservice.DTO.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.PatientResponseDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface PatientController {

    ResponseEntity<List<PatientResponseDTO>> getPatients();

    ResponseEntity<PatientResponseDTO> createPatient(PatientRequestDTO patient);

    ResponseEntity<PatientResponseDTO> updatePatient(PatientRequestDTO patient, UUID patientId);

    ResponseEntity<Void> deletePatient(UUID patientId);

}
