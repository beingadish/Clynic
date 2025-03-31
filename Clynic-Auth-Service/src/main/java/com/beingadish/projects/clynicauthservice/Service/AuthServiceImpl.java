package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.DTO.LoginRequestDTO;
import com.beingadish.projects.clynicauthservice.DTO.SignupRequestDTO;
import com.beingadish.projects.clynicauthservice.Exceptions.EmailAlreadyExistException;
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
                .filter(u -> passwordEncoder.matches(loginRequestDTO.getPassword(), u.getPassword()))
                .map(u -> jwtUtil.generateToken(u.getEmail(), u.getRole()));
    }

    @Override
    public Boolean validateToken(String token) {
        try{
            jwtUtil.validateToken(token);
            return true;
        } catch (Exception e){
            return false;
        }
    }

    @Override
    public void signup(SignupRequestDTO signupRequestDTO) {
        // Check if the user already exists
        Optional<User> existingUser = userService.findByEmail(signupRequestDTO.getEmail());
        if (existingUser.isPresent()) {
            throw new EmailAlreadyExistException("Email is already in use.");
        }

        // Hash the password
        String encodedPassword = passwordEncoder.encode(signupRequestDTO.getPassword());

        // Create a new User object
        User newUser = new User();
        newUser.setEmail(signupRequestDTO.getEmail());
        newUser.setPassword(encodedPassword);
        newUser.setRole(signupRequestDTO.getRole());

        // Save the user
        userService.saveUser(newUser);
    }

}
