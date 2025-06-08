package com.CuteComputerCritters.backend.api.model.Food;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="FOOD")
public class Food {
    @Column(name = "FOOD_ID")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int foodId;

    @JsonProperty("foodName")
    @Column(name = "FOOD_NAME")
    private String foodName;

    @JsonProperty("foodType")
    @Enumerated(EnumType.STRING)
    @Column(name = "FOOD_TYPE")
    private EnumFoodType foodType;

    @JsonProperty("satiation")
    @Column(name = "SATIATION")
    private int satiation;

    public Food(String foodName, EnumFoodType foodType, int satiation) {
        this.foodName = foodName;
        this.foodType = foodType;
        this.satiation = satiation;
    }

    public Food() {
    }
}
