package com.beingadish.projects.clynicauthservice.Controller;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.DTO.LoginResponseDTO;
import com.beingadish.projects.clynicauthservice.DTO.SignupRequestDTO;
import org.springframework.http.ResponseEntity;

public interface AuthController {

    ResponseEntity<String> signup(SignupRequestDTO loginRequestDTO);

    ResponseEntity<LoginResponseDTO> login(LoginRequestDTO loginRequestDTO);

    ResponseEntity<Void> validateToken(String authHeader);
}
