package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.DTO.SignupRequestDTO;

import java.util.Optional;

public interface AuthService {

    Optional<String> authenticate(LoginRequestDTO loginRequestDTO);
    Boolean validateToken(String token);
    void signup(SignupRequestDTO signupRequestDTO);
}
