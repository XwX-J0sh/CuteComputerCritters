package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.service.CritterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CritterController {

    private final CritterService critterService;
    //CRUD MAPPING
}
