package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CritterEvolutionRepository extends JpaRepository<CritterEvolution, Long> {
    Optional<CritterEvolution> findByStage(double stage);
    Optional<CritterEvolution> findEvolutionByStage(double stage);
}
