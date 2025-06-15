package com.CuteComputerCritters.backend.api.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FoodResponse {

    @JsonProperty("foodId")
    private int foodId;

    @JsonProperty("foodName")
    private String foodName;

    @JsonProperty("foodType")
    private String foodType;

    @JsonProperty("satiation")
    private int satiation;
}
