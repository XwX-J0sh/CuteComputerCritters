package com.CuteComputerCritters.backend.api.payload.request.critter;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CritterUpdateRequest {

    @JsonProperty("hunger")
    private Integer hunger;

    @JsonProperty("happiness")
    private Integer happiness;

    @JsonProperty("training")
    private Integer training;

    @JsonProperty("weight")
    private Integer weight;

    @JsonProperty("isHealthy")
    private Boolean isHealthy;

    @JsonProperty("canDefend")
    private Boolean canDefend;

    @JsonProperty("evolution")
    private Float evolution;

    @JsonProperty("isAsleep")
    private Boolean isAsleep;
}
