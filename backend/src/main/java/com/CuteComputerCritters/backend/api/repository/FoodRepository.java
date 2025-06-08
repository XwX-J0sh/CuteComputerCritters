package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.Food.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {
}
