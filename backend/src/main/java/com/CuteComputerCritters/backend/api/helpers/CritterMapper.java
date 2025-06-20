package com.CuteComputerCritters.backend.api.helpers;

import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import org.springframework.stereotype.Component;

@Component
public class CritterMapper {
    public CritterGetResponse mapToResponse(Critter critter, User owner) {
        CritterGetResponse response = new CritterGetResponse();
        response.setCritterId(critter.getCritterId());
        response.setCritterName(critter.getCritterName());
        response.setCreatedAt(critter.getCreatedAt());
        response.setHunger(critter.getHunger());
        response.setHappiness(critter.getHappiness());
        response.setTraining(critter.getTraining());
        response.setTrainingSessions(critter.getTrainingSessions());
        response.setSnackCounter(critter.getSnackCounter());
        response.setMealCounter(critter.getMealCounter());
        response.setWeight(critter.getWeight());
        response.setHealthy(critter.isHealthy());
        response.setCanDefend(critter.isCanDefend());
        response.setEvolution(critter.getEvolution());
        response.setLastAwakeTime(critter.getLastAwakeTime());
        response.setLastSleepTime(critter.getLastSleepTime());
        response.setAsleep(critter.isAsleep());
        response.setSleepCycleDuration(critter.getSleepCycleDuration());
        response.setSleepDuration(critter.getSleepDuration());
        response.setLastInteractionTime(critter.getLastInteractionTime());
        response.setTotalActiveTime(critter.getTotalActiveTime());
        response.setActive(critter.isActive());
        response.setOwnerUsername(owner.getUsername());
        response.setOwnerId(owner.getUserId());
        response.setCareMisses(critter.getCareMisses());
        response.setInjured(critter.isInjured());
        response.setHasCalled(critter.isHasCalled());
        response.setDead(critter.isDead());
        response.setHungrySince(critter.getHungrySince());
        response.setUnhappySince(critter.getUnhappySince());
        response.setSickSince(critter.getSickSince());
        response.setAttackedSince(critter.getAttackedSince());
        response.setInjuredSince(critter.getInjuredSince());
        response.setLightIsOn(critter.isLightIsOn());
        response.setLightOnSince(critter.getLightOnSince());
        response.setCalledSince(critter.getCalledSince());
        response.setSicknessChance(critter.getSicknessChance());
        response.setCallChance(critter.getCallChance());
        response.setDecayRateHappy(critter.getDecayRateHappy());
        response.setDecayRateHunger(critter.getDecayRateHunger());
        response.setTrainingFactor(critter.getTrainingFactor());
        return response;
    }
}
