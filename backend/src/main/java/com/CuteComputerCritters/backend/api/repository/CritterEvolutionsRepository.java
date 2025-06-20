package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolutions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CritterEvolutionsRepository extends JpaRepository<CritterEvolutions, Long> {
    Optional<CritterEvolutions> findByStage(double stage);
}
