package com.beingadish.projects.clynicservice.Controller;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface PatientController {

    ResponseEntity<List<PatientResponseDTO>> getPatients();

    ResponseEntity<PatientResponseDTO> createPatient(PatientRequestDTO patient);

    ResponseEntity<PatientResponseDTO> updatePatient(PatientRequestDTO patient, UUID patientId);

}
