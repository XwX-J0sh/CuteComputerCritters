package com.CuteComputerCritters.backend.api.model.Critter;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="CRITTER_EVOLUTIONS")
public class CritterEvolutions {

    @Id
    @Column(name = "EVOLUTION_STAGE")
    private double stage;

    /*tracks how long the Critter can stay awake
    before it needs sleep (in minutes)*/
    @JsonProperty("sleepCycleDuration")
    @Column(name = "SLEEP_CYCLE_DURATION", columnDefinition = "integer default 30")
    private int sleepCycleDuration;

    /*tracks how long the critter sleeps (in minutes)*/
    @JsonProperty("sleepDuration")
    @Column(name = "SLEEP_DURATION", columnDefinition = "integer default 5")
    private int sleepDuration;

    //DECAY RATES
    @JsonProperty("decayRateHunger")
    @Column(name = "DECAY_RATE_HUNGER", columnDefinition = "int default 1")
    private int decayRateHunger;

    @JsonProperty("decayRateHappy")
    @Column(name = "DECAY_RATE_HAPPY", columnDefinition = "int default 1")
    private int decayRateHappy;

    @JsonProperty("sicknessChance")
    @Column(name = "SICKNESS_CHANCE", columnDefinition = "int default 50")
    private int sicknessChance;

    @JsonProperty("callChance")
    @Column(name = "CALL_CHANCE", columnDefinition = "int default 50")
    private int callChance;

    @JsonProperty("trainingFactor")
    @Column(name ="TRAINING_FACTOR", columnDefinition = "double default 1")
    private double trainingFactor;

    @JsonProperty("evolutionName")
    @Column(name ="EVOLUTION_NAME")
    private String evolutionName;

    public CritterEvolutions(double stage, int sleepCycleDuration, int sleepDuration, int decayRateHunger, int decayRateHappy, int sicknessChance, int callChance, double trainingFactor, String evolutionName) {
        this.stage = stage;
        this.sleepCycleDuration = sleepCycleDuration;
        this.sleepDuration = sleepDuration;
        this.decayRateHunger = decayRateHunger;
        this.decayRateHappy = decayRateHappy;
        this.sicknessChance = sicknessChance;
        this.callChance = callChance;
        this.trainingFactor = trainingFactor;
        this.evolutionName = evolutionName;
    }

    public CritterEvolutions() {
    }
}
