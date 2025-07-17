package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.repository.CritterEvolutionsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CritterEvolutionsService {
    private final CritterEvolutionsRepository critterEvolutionsRepository;
}
