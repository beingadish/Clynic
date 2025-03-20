package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;

import java.util.List;


public interface PatientService {

    public List<PatientResponseDTO> getPatients();

    public PatientResponseDTO createPatient(PatientRequestDTO patient);




}
