package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Mapper.PatientMapper;
import com.beingadish.projects.clynicservice.Model.Patient;
import com.beingadish.projects.clynicservice.Repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    // Dependency Injection
    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }


    @Override
    public List<PatientResponseDTO> getPatients() {
        // Finding all the Patients
        List<Patient> patients = patientRepository.findAll();

        // Converting them into PatientResponseDTOs List & Returning them
        return patients.stream().map(PatientMapper::toDto).toList();
    }

    @Override
    public PatientResponseDTO createPatient(PatientRequestDTO patient) {
        Patient newPatient = patientRepository.save(PatientMapper.toModel(patient));
        return PatientMapper.toDto(newPatient);
    }
}
