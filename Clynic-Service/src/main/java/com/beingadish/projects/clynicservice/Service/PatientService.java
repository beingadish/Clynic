package com.beingadish.projects.clynicservice.Service;

import com.beingadish.projects.clynicservice.DTO.Patient.PatientResponseDTO;
import com.beingadish.projects.clynicservice.Repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;


public interface PatientService {

    public List<PatientResponseDTO> getPatients();




}
