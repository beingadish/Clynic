package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.Model.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;

    public AuthServiceImpl(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Optional<String> authenticate(LoginRequestDTO loginRequestDTO) {

        // Find the User -> Match the Password -> Generate the JWT using Role & Email
        Optional<String> token = userService.findByEmail(loginRequestDTO.getEmail())
                .filter(u -> passwordEncoder.matches(u.getPassword(),loginRequestDTO.getPassword()))
                .map(u -> jwtUtil.generateToken(u.getEmail(), u.getRole()));

        return token;
    }
}
