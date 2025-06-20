package com.CuteComputerCritters.backend.api.payload.response.critter;

import com.CuteComputerCritters.backend.api.model.Critter.Critter;
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

    @JsonProperty("trainingFactor")
    private Double trainingFactor;

    public static CritterGetResponse fromEntity(Critter critter) {
        CritterGetResponse response = new CritterGetResponse();

        response.setCritterId(critter.getCritterId());
        response.setCritterName(critter.getCritterName());
        response.setHappiness(critter.getHappiness());
        response.setHunger(critter.getHunger());
        response.setTraining(critter.getTraining());
        response.setTrainingSessions(critter.getTrainingSessions());
        response.setSnackCounter(critter.getSnackCounter());
        response.setMealCounter(critter.getMealCounter());
        response.setWeight(critter.getWeight());
        response.setEvolution(critter.getEvolutionStage().getStage());
        response.setCareMisses(critter.getCareMisses());
        response.setHealthy(critter.isHealthy());
        response.setCanDefend(critter.isCanDefend());
        response.setAsleep(critter.isAsleep());
        response.setSleepCycleDuration(critter.getEvolutionStage().getSleepCycleDuration());
        response.setSleepDuration(critter.getEvolutionStage().getSleepDuration());
        response.setTotalActiveTime(critter.getTotalActiveTime());
        response.setActive(critter.isActive());
        response.setOwnerId(critter.getOwner().getUserId());
        response.setOwnerUsername(critter.getOwner().getUsername());
        response.setHasCalled(critter.isHasCalled());
        response.setLightIsOn(critter.isLightIsOn());

        response.setLastAwakeTime(critter.getLastAwakeTime());
        response.setLastSleepTime(critter.getLastSleepTime());
        response.setLastInteractionTime(critter.getLastInteractionTime());
        response.setCalledSince(critter.getCalledSince());
        response.setInjured(critter.isInjured());
        response.setInjuredSince(critter.getInjuredSince());
        response.setDead(critter.isDead());
        response.setHungrySince(critter.getHungrySince());
        response.setUnhappySince(critter.getUnhappySince());
        response.setSickSince(critter.getSickSince());
        response.setAttackedSince(critter.getAttackedSince());
        response.setLightOnSince(critter.getLightOnSince());

        response.setDecayRateHunger(critter.getEvolutionStage().getDecayRateHunger());
        response.setDecayRateHappy(critter.getEvolutionStage().getDecayRateHappy());
        response.setSicknessChance(critter.getEvolutionStage().getSicknessChance());
        response.setCallChance(critter.getEvolutionStage().getCallChance());
        response.setTrainingFactor(critter.getEvolutionStage().getTrainingFactor());

        return response;
    }

}