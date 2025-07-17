package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.repository.CritterEvolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CritterEvolutionsService {
    private final CritterEvolutionRepository critterEvolutionsRepository;
}
