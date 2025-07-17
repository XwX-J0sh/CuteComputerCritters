package com.CuteComputerCritters.backend.api.helpers;

import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolutions;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import org.springframework.stereotype.Component;

@Component
public class CritterMapper {

    public CritterGetResponse mapToResponse(Critter critter, User owner) {
        CritterGetResponse response = new CritterGetResponse();

        // Basic critter info
        response.setCritterId(critter.getCritterId());
        response.setCritterName(critter.getCritterName());
        response.setCreatedAt(critter.getCreatedAt());

        // Vital stats
        response.setHunger(critter.getHunger());
        response.setHappiness(critter.getHappiness());
        response.setTraining(critter.getTraining());
        response.setTrainingSessions(critter.getTrainingSessions());
        response.setSnackCounter(critter.getSnackCounter());
        response.setMealCounter(critter.getMealCounter());
        response.setWeight(critter.getWeight());
        response.setCareMisses(critter.getCareMisses());

        // Health and status
        response.setHealthy(critter.isHealthy());
        response.setSickSince(critter.getSickSince());
        response.setInjured(critter.isInjured());
        response.setInjuredSince(critter.getInjuredSince());
        response.setCanDefend(critter.isCanDefend());
        response.setAttackedSince(critter.getAttackedSince());
        response.setDead(critter.isDead());

        // Time-related info
        response.setLastAwakeTime(critter.getLastAwakeTime());
        response.setLastSleepTime(critter.getLastSleepTime());
        response.setAsleep(critter.isAsleep());
        response.setLastInteractionTime(critter.getLastInteractionTime());
        response.setTotalActiveTime(critter.getTotalActiveTime());
        response.setActive(critter.isActive());

        // Call/light status
        response.setHasCalled(critter.isHasCalled());
        response.setCalledSince(critter.getCalledSince());
        response.setLightIsOn(critter.isLightIsOn());
        response.setLightOnSince(critter.getLightOnSince());

        // Hunger/unhappiness timestamps
        response.setHungrySince(critter.getHungrySince());
        response.setUnhappySince(critter.getUnhappySince());

        // Owner info
        response.setOwnerId(owner.getUserId());
        response.setOwnerUsername(owner.getUsername());

        // Evolution-based info
        CritterEvolutions evo = critter.getEvolutionStage();
        if (evo != null) {
            response.setEvolution(evo.getStage());
            response.setEvolutionName(evo.getEvolutionName());
            response.setSleepCycleDuration(evo.getSleepCycleDuration());
            response.setSleepDuration(evo.getSleepDuration());
            response.setDecayRateHunger(evo.getDecayRateHunger());
            response.setDecayRateHappy(evo.getDecayRateHappy());
            response.setSicknessChance(evo.getSicknessChance());
            response.setCallChance(evo.getCallChance());
            response.setTrainingFactor(evo.getTrainingFactor());
        }

        return response;
    }
}
