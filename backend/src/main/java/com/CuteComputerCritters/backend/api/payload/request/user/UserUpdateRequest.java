package com.CuteComputerCritters.backend.api.payload.request.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String username;
    private String email;
}
