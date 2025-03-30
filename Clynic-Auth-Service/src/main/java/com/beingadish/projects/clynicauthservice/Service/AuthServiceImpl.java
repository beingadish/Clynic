package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.Model.User;
import com.beingadish.projects.clynicauthservice.Utils.JWTUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    private final JWTUtil jwtUtil;

    public AuthServiceImpl(UserService userService, PasswordEncoder passwordEncoder, JWTUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Optional<String> authenticate(LoginRequestDTO loginRequestDTO) {

        // Find the User -> Match the Password -> Generate the JWT using Role & Email --> Return

        return userService.findByEmail(loginRequestDTO.getEmail())
                .filter(u -> passwordEncoder.matches(u.getPassword(),loginRequestDTO.getPassword()))
                .map(u -> jwtUtil.generateToken(u.getEmail(), u.getRole()));
    }
}
