package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class MedicineService {
    private final MedicineRepository medicineRepository;
}
