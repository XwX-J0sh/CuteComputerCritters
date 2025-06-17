package com.CuteComputerCritters.backend.api.model;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

    @JsonProperty("happiness")
    @Column(name = "HAPPINESS", columnDefinition = "integer default 10")
    private int happiness;

    @JsonProperty("training")
    @Column(name = "TRAINING", columnDefinition = "integer default 10")
    private int training;

    @JsonProperty("weight")
    @Column(name = "WEIGHT", columnDefinition = "integer default 1")
    private int weight;

    @JsonProperty("isHealthy")
    @Column(name = "IS_HEALTHY", columnDefinition = "boolean default true")
    private boolean isHealthy;

    @JsonProperty("canDefend")
    @Column(name = "CAN_DEFEND", columnDefinition = "boolean default false")
    private boolean canDefend;

    @JsonProperty("evolution")
    @Column(name = "EVOLUTION", columnDefinition = "float default 1.0")
    private float evolution;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User owner;

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
    @Column(name = "SLEEP_CYCLE_DURATION", columnDefinition = "integer default 10")
    private int sleepCycleDuration;

    /*tracks how long the critter sleeps (in seconds)*/
    @JsonProperty("sleepDuration")
    @Column(name = "SLEEP_DURATION", columnDefinition = "integer default 60")
    private int sleepDuration;

    //tracks when the Critter was last interacted with/the User was logged in
    @CreationTimestamp
    @JsonProperty("lastInteractionTime")
    @Column(name = "LAST_INTERACTION_TIME")
    private Instant lastInteractionTime;

    //tracks whether the Critter is being played with
    @JsonProperty
    @Column(name = "IS_ACTIVE")
    private boolean isActive;

}
