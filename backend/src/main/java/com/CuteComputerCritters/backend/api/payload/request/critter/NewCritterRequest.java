package com.CuteComputerCritters.backend.api.payload.request.critter;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewCritterRequest {
    @NotBlank
    @JsonProperty("critterName")
    private String critterName;
}
