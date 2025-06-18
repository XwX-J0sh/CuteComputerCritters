package com.CuteComputerCritters.backend.api.payload.request.critter;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

@Data
public class CritterUpdateRequest {

    @JsonProperty("hunger")
    private Integer hunger;

    @JsonProperty("happiness")
    private Integer happiness;

    @JsonProperty("training")
    private Integer training;

    @JsonProperty("trainingSessions")
    private Integer trainingSessions;

    @JsonProperty("snackCounter")
    private Integer snackCounter;

    @JsonProperty("mealCounter")
    private Integer mealCounter;

    @JsonProperty("weight")
    private Integer weight;

    @JsonProperty("isHealthy")
    private Boolean isHealthy;

    @JsonProperty("canDefend")
    private Boolean canDefend;

    @JsonProperty("evolution")
    private Double evolution;

    @JsonProperty("isAsleep")
    private Boolean isAsleep;

    @JsonProperty("careMisses")
    private Integer careMisses;

    @JsonProperty("hasCalled")
    private Boolean hasCalled;

    @JsonProperty("isInjured")
    private Boolean isInjured;

    @JsonProperty("isDead")
    private Boolean isDead;

    @JsonProperty("hungrySince")
    private Instant hungrySince;

    @JsonProperty("unhappySince")
    private Instant unhappySince;

    @JsonProperty("sickSince")
    private Instant sickSince;

    @JsonProperty("injuredSince")
    private Instant injuredSince;

    @JsonProperty("attackedSince")
    private Instant attackedSince;

    @JsonProperty("lightIsOn")
    private Boolean lightIsOn;

    @JsonProperty("lightOnSince")
    private Instant lightOnSince;

    @JsonProperty("calledSince")
    private Instant calledSince;

    @JsonProperty("decayRateHunger")
    private int decayRateHunger;

    @JsonProperty("decayRateHappy")
    private Integer decayRateHappy;

    @JsonProperty("sicknessChance")
    private Integer sicknessChance;

    @JsonProperty("callChance")
    private Integer callChance;

    @JsonProperty("trainingFactor")
    private double trainingFactor;
}