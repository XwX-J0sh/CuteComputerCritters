package com.CuteComputerCritters.backend.api.payload.response.critter;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("weight")
    private int weight;

    @JsonProperty("isHealthy")
    private boolean isHealthy;

    @JsonProperty("canDefend")
    private boolean canDefend;

    @JsonProperty("evolution")
    private float evolution;

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

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("ownerUsername")
    private String ownerUsername;

    @JsonProperty("ownerId")
    private int ownerId;
}
