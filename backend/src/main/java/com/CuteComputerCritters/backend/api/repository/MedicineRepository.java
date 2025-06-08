package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.medicine.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
}
