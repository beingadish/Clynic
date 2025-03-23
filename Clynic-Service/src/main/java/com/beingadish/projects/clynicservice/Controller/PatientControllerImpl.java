package com.beingadish.projects.clynicservice.Controller;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Mapper.PatientMapper;
import com.beingadish.projects.clynicservice.Service.PatientService;
import jakarta.validation.Valid;
import jakarta.validation.groups.Default;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
public class PatientControllerImpl implements PatientController {

    private final PatientService patientService;

    PatientControllerImpl(PatientService patientService) {
        this.patientService = patientService;
    }

    @Override
    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> getPatients() {
        List<PatientResponseDTO> patients = patientService.getPatients();
        return ResponseEntity.ok().body(patients);
    }

    @Override
    @PostMapping
    public ResponseEntity<PatientResponseDTO> createPatient(@Valid @RequestBody PatientRequestDTO patient) {
        return ResponseEntity.ok().body(patientService.createPatient(patient));
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> updatePatient(@Validated({Default.class}) @RequestBody PatientRequestDTO patient, @PathVariable UUID id) {
        return ResponseEntity.ok().body(patientService.updatePatient(id, patient));
    }
}