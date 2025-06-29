package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolutions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CritterRepository extends JpaRepository<Critter, Integer> {
    List<Critter> findByOwner_UserId(int userId);
    List<Critter> findByIsActiveTrueAndIsDeadFalse();
}