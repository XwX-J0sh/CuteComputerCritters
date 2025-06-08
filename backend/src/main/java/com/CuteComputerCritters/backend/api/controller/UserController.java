package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    //Mapping CRUD

    //Get all users
    @GetMapping("/User")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> allUsers = userService.getAllUsers();
        return ResponseEntity.ok(allUsers);
    }
}
