package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import java.util.Optional;

public interface AuthService {

    public Optional<String> authenticate(LoginRequestDTO loginRequestDTO);

}
