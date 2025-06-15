package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/medicine")
public class MedicineController {
    private final MedicineService medicineService;
}
