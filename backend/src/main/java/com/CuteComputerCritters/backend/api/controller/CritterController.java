package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.service.CritterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/critter")
public class CritterController {

    private final CritterService critterService;

    //create critter
    @PostMapping("/new")

}
