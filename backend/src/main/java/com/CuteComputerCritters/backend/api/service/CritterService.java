package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CritterService {
    private CritterRepository critterRepository;
}
