package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineService medicineService;
}
