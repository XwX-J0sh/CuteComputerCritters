package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.request.UserUpdateRequest;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetailsImpl userDetails) {
            LinkedHashMap<String, Object> userInfo = new LinkedHashMap<>();

            userInfo.put("id", userDetails.getId());
            userInfo.put("username", userDetails.getUsername());
            userInfo.put("email", userDetails.getEmail());
            userInfo.put("roles", userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(userInfo);
        }
        System.out.println("Authenticated user: " + authentication.getName());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    /**
     * XwX:
     * PROBLEM: patching means the token (which was made using the old username) is useless
     * to change the username means one also has to change the token
     * will update at a later date
    @PatchMapping
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequest updates, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        if (updates.getUsername() != null)
            user.setUsername(updates.getUsername());

        if (updates.getEmail() != null)
            user.setEmail(updates.getEmail());

        userRepository.save(user);
        return ResponseEntity.ok("User updated.");
    }*/

}
