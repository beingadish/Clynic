package com.beingadish.projects.clynicauthservice.Service;

import com.beingadish.projects.clynicauthservice.Model.User;

import java.util.Optional;

public interface UserService {

    Optional<User> findByEmail(String email);



}
