package com.beingadish.projects.clynicservice.Mapper;

import com.beingadish.projects.clynicservice.DTO.PatientRequestDTO;
import com.beingadish.projects.clynicservice.DTO.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Model.Patient;

import java.time.LocalDate;

public class PatientMapper {

    public static PatientResponseDTO toDto(Patient patient){
        PatientResponseDTO patientResponseDTO = new PatientResponseDTO();
        patientResponseDTO.setName(patient.getName());
        patientResponseDTO.setEmail(patient.getEmail());
        patientResponseDTO.setAddress(patient.getAddress());
        patientResponseDTO.setId(patient.getId().toString());
        patientResponseDTO.setDateOfBirth(patient.getDateOfBirth().toString());
        return patientResponseDTO;
    }

    public static Patient toModel(PatientRequestDTO patientRequestDTO){
        Patient patient = new Patient();
        patient.setName(patientRequestDTO.getName());
        patient.setEmail(patientRequestDTO.getEmail());
        patient.setAddress(patientRequestDTO.getAddress());
        patient.setRegisteredDate(LocalDate.parse(patientRequestDTO.getRegisteredDate()));
        patient.setDateOfBirth(LocalDate.parse(patientRequestDTO.getDateOfBirth()));
//        patient.setId(UUID.randomUUID());
        return patient;
    }
}
