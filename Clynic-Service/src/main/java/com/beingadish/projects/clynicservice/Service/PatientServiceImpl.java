package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Model.Patient;
import com.beingadish.projects.clynicservice.Repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {

    private PatientRepository patientRepository;

    // Dependency Injection
    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }


    @Override
    public List<PatientResponseDTO> getPatients() {
        List<Patient> patients = patientRepository.findAll();

    }
}
