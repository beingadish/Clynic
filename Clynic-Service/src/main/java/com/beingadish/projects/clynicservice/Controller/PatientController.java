package com.beingadish.projects.clynicservice.Controller;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface PatientController {

    ResponseEntity<List<PatientResponseDTO>> getPatients();

    ResponseEntity<PatientResponseDTO> createPatient(PatientRequestDTO patient);

}
