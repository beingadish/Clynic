package com.beingadish.projects.clynicauthservice.Controller;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.DTO.LoginResponseDTO;
import org.springframework.http.ResponseEntity;

public interface AuthController {

    ResponseEntity<LoginResponseDTO> login(LoginRequestDTO loginRequestDTO);
}
