package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FoodService {
    private final FoodRepository foodRepository;
}
