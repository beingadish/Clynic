package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Exception.EmailAlreadyExistException;
import com.beingadish.projects.clynicservice.Exception.PatientNotFoundException;
import com.beingadish.projects.clynicservice.Mapper.PatientMapper;
import com.beingadish.projects.clynicservice.Model.Patient;
import com.beingadish.projects.clynicservice.Repository.PatientRepository;
import com.beingadish.projects.clynicservice.gRPC.BillingServiceGrpcClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final BillingServiceGrpcClient billingServiceGrpcClient;


    // Dependency Injection
    public PatientServiceImpl(PatientRepository patientRepository, BillingServiceGrpcClient billingServiceGrpcClient) {
        this.patientRepository = patientRepository;
        this.billingServiceGrpcClient = billingServiceGrpcClient;
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
            // On Successful creation of New Patient we create a new billing account for the Patient
            billingServiceGrpcClient.createBillingAccount(newPatient.getId().toString(),newPatient.getName(),newPatient.getEmail());
            return PatientMapper.toDto(newPatient);
        }

    }

    @Override
    public PatientResponseDTO updatePatient(UUID patientUuid, PatientRequestDTO patientRequestDTO) {

        // If Patient Not Found then Exception Will automatically gets handled
        Patient patient1 = patientRepository.findById(patientUuid).orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientUuid));
        if(patientRepository.existsByEmailAndIdNot(patientRequestDTO.getEmail(),patientUuid)) {
            throw new EmailAlreadyExistException("A patient with this email already exists" + patientRequestDTO.getEmail());
        } else {
            patient1.setEmail(patientRequestDTO.getEmail());
            patient1.setDateOfBirth(LocalDate.parse(patientRequestDTO.getDateOfBirth()));
            patient1.setAddress(patientRequestDTO.getAddress());
            patient1.setName(patientRequestDTO.getName());
            Patient updatedPatient = patientRepository.save(patient1);
            return PatientMapper.toDto(updatedPatient);
        }
    }

    @Override
    public void deletePatient(UUID id) {
        // If Patient Not Found then Exception Will automatically gets handled
        Patient patient1 = patientRepository.findById(id).orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        patientRepository.delete(patient1);
    }
}
