package com.CuteComputerCritters.backend.api.security.jwt;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private int id;
    private String username;
    private String email;
    private List<String> roles;

    public JwtResponse(int id, String username, String email, List<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

}
