package com.CuteComputerCritters.backend.api.payload.response.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@AllArgsConstructor
@Data
public class UserInfoResponse {
    private int id;
    private String username;
    private String email;
    private List<String> roles;

}
