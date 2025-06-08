package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FoodController {
    public final FoodService foodService;
}
