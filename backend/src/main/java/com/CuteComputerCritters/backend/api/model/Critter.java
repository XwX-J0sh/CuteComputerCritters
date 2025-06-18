package com.CuteComputerCritters.backend.api.model;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Data
@Entity
@Table(name="CRITTER")
public class Critter {

    @Column(name = "CRITTER_ID")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int critterId;

    @NotBlank
    @JsonProperty("critterName")
    @Column(name = "CRITTER_NAME")
    private String critterName;

    @CreationTimestamp
    @JsonProperty("createdAt")
    @Column(name = "CREATED_AT")
    private Instant createdAt;

    @JsonProperty("hunger")
    @Column(name = "HUNGER", columnDefinition = "integer default 10")
    private int hunger;

    @JsonProperty("hungrySince")
    @Column(name = "HUNGRY_SINCE")
    private Instant hungrySince;

    @JsonProperty("happiness")
    @Column(name = "HAPPINESS", columnDefinition = "integer default 10")
    private int happiness;

    @JsonProperty("unhappySince")
    @Column(name = "UNHAPPY_SINCE")
    private Instant unhappySince;

    @JsonProperty("training")
    @Column(name = "TRAINING", columnDefinition = "integer default 0")
    private int training;

    @JsonProperty("trainingSessions")
    @Column(name = "TRAINING_SESSIONS", columnDefinition = "integer default 0")
    private int trainingSessions;

    @JsonProperty("snackCounter")
    @Column(name = "SNACK_COUNTER", columnDefinition = "integer default 0")
    private int snackCounter;

    @JsonProperty("mealCounter")
    @Column(name = "MEAL_COUNTER", columnDefinition = "integer default 0")
    private int mealCounter;

    @JsonProperty("weight")
    @Column(name = "WEIGHT", columnDefinition = "integer default 1")
    private int weight;

    //tracks whether the pet is sick or not
    @JsonProperty("isHealthy")
    @Column(name = "IS_HEALTHY", columnDefinition = "boolean default true")
    private boolean isHealthy;

    @JsonProperty("sickSince")
    @Column(name = "SICK_SINCE")
    private Instant sickSince;

    //tracks whether the pet is injured or not
    @JsonProperty("isInjured")
    @Column(name = "IS_INJURED", columnDefinition = "boolean default false")
    private boolean isInjured;

    @JsonProperty("uinjuredSince")
    @Column(name = "INJURED_SINCE")
    private Instant injuredSince;

    @JsonProperty("canDefend")
    @Column(name = "CAN_DEFEND", columnDefinition = "boolean default false")
    private boolean canDefend;

    @JsonProperty("attackedSince")
    @Column(name = "ATTACKED_SINCE")
    private Instant attackedSince;

    @JsonProperty("evolution")
    @Column(name = "EVOLUTION", columnDefinition = "double default 1.0")
    private double evolution;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User owner;

    @JsonProperty("careMisses")
    @Column(name = "CARE_MISSES", columnDefinition = "integer default 0")
    private int careMisses;

    //tracks whether the user has turned the light on/off
    @JsonProperty("lightIsOn")
    @Column(name = "LIGHT_IS_ON", columnDefinition = "boolean default true")
    private boolean lightIsOn;

    //tracks since when the user has turned the light on/off
    @JsonProperty("lightOnSince")
    @Column(name = "LIGHT_IS_ON_SINCE")
    private Instant lightOnSince;

    //tracks when the Critter was last awake (Timestamp)
    @JsonProperty("lastAwakeTime")
    @Column(name = "LAST_AWAKE_TIME", nullable = true)
    private Instant lastAwakeTime;

    //tracks when the Critter was last asleep (Timestamp)
    @CreationTimestamp
    @JsonProperty("lastSleepTime")
    @Column(name = "LAST_SLEEP_TIME")
    private Instant lastSleepTime;

    @ColumnDefault(value = "false")
    //tracks if the Critter is sleeping
    @JsonProperty("isAsleep")
    @Column(name = "IS_ASLEEP")
    private boolean isAsleep;

    /*tracks how long the Critter can stay awake
    before it needs sleep (in minutes)*/
    @JsonProperty("sleepCycleDuration")
    @Column(name = "SLEEP_CYCLE_DURATION", columnDefinition = "integer default 30")
    private int sleepCycleDuration;

    /*tracks how long the critter sleeps (in minutes)*/
    @JsonProperty("sleepDuration")
    @Column(name = "SLEEP_DURATION", columnDefinition = "integer default 5")
    private int sleepDuration;

    //tracks the last time the pet was interacted with
    @JsonProperty("lastInteractionTime")
    @Column(name = "LAST_INTERACTION_TIME")
    private Instant lastInteractionTime;

    //tracks the amount of time the critter has been played with/active in seconds
    @Column(name = "TOTAL_ACTIVE_TIME")
    private Long totalActiveTime = 0L;

    //tracks whether the Critter is being played with
    @JsonProperty("isActive")
    @Column(name = "IS_ACTIVE", columnDefinition = "boolean default false")
    private boolean isActive;

    //tracks whether the Critter has made a call
    @JsonProperty("hasCalled")
    @Column(name = "HAS_CALLED", columnDefinition = "boolean default false")
    private boolean hasCalled;

    @JsonProperty("calledSince")
    @Column(name = "CALLED_SINCE")
    private Instant calledSince;

    //tracks whether the Critter is dead
    @JsonProperty("isDead")
    @Column(name = "IS_DEAD", columnDefinition = "boolean default false")
    private boolean isDead;

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

}