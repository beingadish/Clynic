package com.beingadish.projects.clynicservice.Controller;

import com.beingadish.projects.clynicservice.DTO.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.PatientResponseDTO;
import com.beingadish.projects.clynicservice.DTO.Validators.CreatePatientValidationGroup;
import com.beingadish.projects.clynicservice.Service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.groups.Default;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@Tag(name = "Patient", description = "API for managing patients") // Swagger UI Implementation
public class PatientControllerImpl implements PatientController {

    private final PatientService patientService;

    PatientControllerImpl(PatientService patientService) {
        this.patientService = patientService;
    }

    @Override
    @GetMapping
    @Operation(summary = "Get Patients")
    public ResponseEntity<List<PatientResponseDTO>> getPatients() {
        List<PatientResponseDTO> patients = patientService.getPatients();
        return ResponseEntity.ok().body(patients);
    }

    @Override
    @PostMapping
    @Operation(summary = "Create Patient")
    public ResponseEntity<PatientResponseDTO> createPatient(@Validated({Default.class, CreatePatientValidationGroup.class}) @RequestBody PatientRequestDTO patient) {
        return ResponseEntity.ok().body(patientService.createPatient(patient));
    }

    @Override
    @PutMapping("/{id}")
    @Operation(summary = "Update Patient")
    public ResponseEntity<PatientResponseDTO> updatePatient(@Validated({Default.class}) @RequestBody PatientRequestDTO patient, @PathVariable UUID id) {
        return ResponseEntity.ok().body(patientService.updatePatient(id, patient));
    }

    @Override
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Patient")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }


}