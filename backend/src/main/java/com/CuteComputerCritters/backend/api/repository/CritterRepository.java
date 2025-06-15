package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.Critter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CritterRepository extends JpaRepository<Critter, Integer> {
    List<Critter> findByOwner_UserId(int userId);
}
