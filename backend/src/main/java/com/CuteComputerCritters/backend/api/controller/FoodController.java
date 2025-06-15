package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.payload.response.FoodResponse;
import com.CuteComputerCritters.backend.api.payload.response.MessageResponse;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import com.CuteComputerCritters.backend.api.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/food")
public class FoodController {
    public final FoodService foodService;
    private final FoodRepository foodRepository;

    //get Food by foodName
    @GetMapping("/{foodName}")
    public ResponseEntity<?> getSatiation (Authentication authentication, @PathVariable String foodName) {

        //authenticate the request
        if (authentication == null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Food food = foodRepository.findByFoodName(foodName);

        if(food.equals(null)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Food not found");
        }

        FoodResponse response = new FoodResponse();
        response.setFoodId(food.getFoodId());
        response.setFoodName(foodName);
        response.setFoodType((food.getFoodType()).toString());
        response.setSatiation(food.getSatiation());

        return ResponseEntity.ok(response);
    }
}
