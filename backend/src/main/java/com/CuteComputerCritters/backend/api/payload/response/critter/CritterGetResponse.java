package com.CuteComputerCritters.backend.api.payload.response.critter;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import lombok.Data;

import java.time.Instant;

@Data
public class CritterGetResponse {

    @JsonProperty("critterId")
    private int critterId;

    @JsonProperty("critterName")
    private String critterName;

    @JsonProperty("createdAt")
    private Instant createdAt;

    @JsonProperty("hunger")
    private int hunger;

    @JsonProperty("happiness")
    private int happiness;

    @JsonProperty("training")
    private int training;

    @JsonProperty("trainingSessions")
    private int trainingSessions;

    @JsonProperty("snackCounter")
    private int snackCounter;

    @JsonProperty("mealCounter")
    private int mealCounter;

    @JsonProperty("weight")
    private int weight;

    @JsonProperty("isHealthy")
    private boolean isHealthy;

    @JsonProperty("canDefend")
    private boolean canDefend;

    @JsonProperty("evolution")
    private double evolution;

    @JsonProperty("careMisses")
    private int careMisses;

    @JsonProperty("lastAwakeTime")
    private Instant lastAwakeTime;

    @JsonProperty("lastSleepTime")
    private Instant lastSleepTime;

    @JsonProperty("isAsleep")
    private boolean isAsleep;

    @JsonProperty("sleepCycleDuration")
    private int sleepCycleDuration;

    @JsonProperty("sleepDuration")
    private int sleepDuration;

    @JsonProperty("lastInteractionTime")
    private Instant lastInteractionTime;

    @JsonProperty("totalActiveTime")
    private Long totalActiveTime;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("ownerUsername")
    private String ownerUsername;

    @JsonProperty("ownerId")
    private int ownerId;

    @JsonProperty("hasCalled")
    private boolean hasCalled;

    @JsonProperty("isInjured")
    private boolean isInjured;

    @JsonProperty("isDead")
    private boolean isDead;

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
}