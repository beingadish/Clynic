package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Exception.EmailAlreadyExistException;
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
    public PatientResponseDTO createPatient(PatientRequestDTO patientRequestDTO) {
        if(patientRepository.existsByEmail(patientRequestDTO.getEmail())) {
            throw new EmailAlreadyExistException("A patient with this email already exists" + patientRequestDTO.getEmail());
        } else {
            Patient newPatient = patientRepository.save(PatientMapper.toModel(patientRequestDTO));
            return PatientMapper.toDto(newPatient);
        }

    }
}
