package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.PatientResponseDTO;

import java.util.List;
import java.util.UUID;


public interface PatientService {

    List<PatientResponseDTO> getPatients();

    PatientResponseDTO createPatient(PatientRequestDTO patient);

    PatientResponseDTO updatePatient(UUID patientUuid, PatientRequestDTO patient);

    void deletePatient(UUID patientUuid);
}
