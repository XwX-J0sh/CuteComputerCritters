package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.helpers.CritterMapper;
import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolution;
import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType;
import com.CuteComputerCritters.backend.api.payload.request.critter.CritterUpdateRequest;
import com.CuteComputerCritters.backend.api.payload.request.critter.NewCritterRequest;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.CritterEvolutionRepository;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CritterService {

    private final CritterRepository critterRepository;
    private final FoodRepository foodRepository;
    private final CritterMapper critterMapper;
    private static final int MAX_STAT = 10;
    private static final int MAX_WEIGHT = 30;
    private static final int MIN_WEIGHT = 1;
    private final CritterEvolutionRepository critterEvolutionsRepository;
    private static final Logger logger = LoggerFactory.getLogger(CritterService.class);


    @Transactional
    public CritterGetResponse createNewCritter(NewCritterRequest request, User owner) {

        Critter critter = new Critter();

        // Load default evolution stage
        CritterEvolution baseStage = critterEvolutionsRepository
                .findByStage(1.0)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default evolution stage not found"
                ));

        critter.setOwner(owner);
        critter.setCritterName(request.getCritterName());
        critter.setCreatedAt(Instant.now());
        critter.setLastSleepTime(Instant.now());
        critter.setLastInteractionTime(Instant.now());
        critter.setHunger(10);
        critter.setHappiness(10);
        critter.setTraining(0);
        critter.setTrainingSessions(0);
        critter.setSnackCounter(0);
        critter.setMealCounter(0);
        critter.setWeight(1);
        critter.setHealthy(true);
        critter.setCanDefend(false);
        critter.setEvolutionStage(baseStage);
        critter.setAsleep(false);
        critter.setActive(false);
        critter.setTotalActiveTime(0L);
        critter.setCareMisses(0);
        critter.setInjured(false);
        critter.setHasCalled(false);
        critter.setDead(false);
        critter.setInjuredSince(null);
        critter.setUnhappySince(null);
        critter.setHungrySince(null);
        critter.setSickSince(null);
        critter.setAttackedSince(null);
        critter.setLightIsOn(true);
        critter.setLightOnSince(null);
        critter.setCalledSince(null);

        critterRepository.save(critter);
        return critterMapper.mapToResponse(critter, owner); // You can extract this to a mapper class later.
    }

    @Transactional
    public CritterGetResponse getCritterById(int ownerId, int critterId) {
        Critter critter = getOwnedCritter(critterId, ownerId);
        return critterMapper.mapToResponse(critter, critter.getOwner());
    }

    @Transactional
    public List<CritterGetResponse> getAllCrittersForUser(User owner) {
        List<Critter> critters = critterRepository.findByOwner_UserId(owner.getUserId());
        return critters.stream()
                .map(c -> critterMapper.mapToResponse(c, owner))
                .toList();
    }

    @Transactional
    public void updateCritter(int critterId, int ownerId, CritterUpdateRequest critterUpdateRequest) {
        Critter critter = getOwnedCritter(critterId, ownerId);

        // Apply only provided updates
        if (critterUpdateRequest.getHunger() != null) critter.setHunger(critterUpdateRequest.getHunger());
        if (critterUpdateRequest.getHappiness() != null) critter.setHappiness(critterUpdateRequest.getHappiness());
        if (critterUpdateRequest.getTraining() != null) critter.setTraining(critterUpdateRequest.getTraining());
        if (critterUpdateRequest.getWeight() != null) critter.setWeight(critterUpdateRequest.getWeight());
        if (critterUpdateRequest.getIsHealthy() != null) critter.setHealthy(critterUpdateRequest.getIsHealthy());
        if (critterUpdateRequest.getCanDefend() != null) critter.setCanDefend(critterUpdateRequest.getCanDefend());
        if (critterUpdateRequest.getIsAsleep() != null) critter.setAsleep(critterUpdateRequest.getIsAsleep());
        if (critterUpdateRequest.getCareMisses() != null) critter.setCareMisses(critterUpdateRequest.getCareMisses());
        if (critterUpdateRequest.getHasCalled() != null) critter.setHasCalled(critterUpdateRequest.getHasCalled());
        if (critterUpdateRequest.getIsInjured() != null) critter.setInjured(critterUpdateRequest.getIsInjured());
        if (critterUpdateRequest.getEvolution() != null) {
            CritterEvolution newStage = critterEvolutionsRepository
                    .findByStage(critterUpdateRequest.getEvolution())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid evolution stage"));
            critter.setEvolutionStage(newStage);
        }

        critterRepository.save(critter);
    }

    @Transactional
    public void deleteCritter(int ownerId, int critterId) {
        Critter critter = getOwnedCritter(critterId, ownerId);
        critterRepository.delete(critter);
    }

    @Transactional
    public void startPlaying(int ownerId, int critterId) {
        Critter critter = getOwnedCritter(critterId, ownerId);
        if(critter.isActive()){
            logger.info("Already activated!");
        }
        critter.setActive(true);
        critterRepository.save(critter);
    }

    @Transactional
    public void stopPlaying(int ownerId, int critterId) {
        Critter critter = getOwnedCritter(critterId, ownerId);
        if(critter.isActive()){
            logger.info("Already deactivated!");
        }
        critter.setActive(false);
        critterRepository.save(critter);
    }

    @Transactional
    public void feedCritter(int ownerId, int critterId, String foodName) {
        Critter critter = getOwnedCritter(critterId, ownerId);
        if (critter.getHunger() == 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not hungry!");
        }

        Food food = Optional.ofNullable(foodRepository.findByFoodName(foodName))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Food not found"));

        int satiation = food.getSatiation();
        int newHunger = Math.min(critter.getHunger() + satiation, 10);
        critter.setHunger(newHunger);

        if (food.getFoodType().toString().equals("SNACK")) {
            int newHappiness = (critter.getEvolutionStage().getStage() < 2.3)
                    ? Math.min(critter.getHappiness() + (int) (satiation * 1.5), 10)
                    : Math.min(critter.getHappiness() + satiation, 10);

            critter.setSnackCounter(critter.getSnackCounter() + 1);
            critter.setHappiness(newHappiness);
        } else {
            critter.setMealCounter(critter.getMealCounter() + 1);
        }

        // Track weight
        if (critter.getSnackCounter() % 3 == 0 && critter.getSnackCounter() != 0) {
            critter.setWeight(Math.min(critter.getWeight() + 6, MAX_WEIGHT));
        }

        if (critter.getMealCounter() % 3 == 0 && critter.getMealCounter() != 0) {
            critter.setWeight(Math.min(critter.getWeight() + 5, MAX_WEIGHT));
        }

        critterRepository.save(critter);

    }

    @Transactional
    public void trainCritter(int critterId, int ownerId, int trainingValue){
        int newHappiness;
        int newTrainingValue;

        Critter critter = getOwnedCritter(critterId, ownerId);
        int newTrainingSessions = critter.getTrainingSessions() + 1;

        if(critter.getEvolutionStage().getStage() < 2) {
            //children learn faster and are happier with learning/play
            newHappiness = Math.min(critter.getHappiness() + trainingValue, MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + trainingValue, MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);

            if (newTrainingSessions % 2 == 0) {
                critter.setWeight(Math.max(critter.getWeight() - 2, MIN_WEIGHT));
            }
        } else if (critter.getEvolutionStage().getStage() == 2.0) {
            //adults learn slower and are less enthusiastic
            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/2), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/2), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);

            if (newTrainingSessions % 2 == 0) {
                critter.setWeight(Math.max(critter.getWeight() - 2, MIN_WEIGHT));
            }
        } else if (critter.getEvolutionStage().getStage() == 2.1) {
            /*Hachiware is just really playful so happiness grows at a rate as fast as with kids
             * training/learning value is similair to standard adults though (Chiikawa)*/

            newHappiness = Math.min(critter.getHappiness() + trainingValue, MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/2), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);

            if (newTrainingSessions % 2 == 0) {
                critter.setWeight(Math.max(critter.getWeight() - 2, MIN_WEIGHT));
            }
        } else if (critter.getEvolutionStage().getStage() == 2.2) {
            /*similar case as with Hachiware except the other way around
             * Schisa is well behaved so their training stats grow as fast as that of kids
             * happiness is similair to standard though*/

            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/2), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + trainingValue, MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);

            if (newTrainingSessions % 2 == 0) {
                critter.setWeight(Math.max(critter.getWeight() - 3, MIN_WEIGHT));
            }
        }
        else {
            /* Usagi and Momonga do not enjoy training*/
            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/3), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/3), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);

            if (newTrainingSessions % 2 == 0) {
                critter.setWeight(Math.max(critter.getWeight() - 1, MIN_WEIGHT));
            }
        }

        critter.setTrainingSessions(newTrainingSessions);
        critterRepository.save(critter);
    }

    @Transactional
    public void respondToCall(int critterId, int ownerId) {

        Critter critter = getOwnedCritter(critterId, ownerId);

        if(!(critter.isHasCalled())){
            //if the critter did not call but the User responded:
            logger.info("Responded unnecessarily");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter did not call");
        }

        critter.setHasCalled(false);
        critterRepository.save(critter);
    }

    @Transactional
    public void healCritter(int critterId, int ownerId, String medicineType) {

        Critter critter = getOwnedCritter(critterId, ownerId);

        //if the critter is healthy and uninjured
        if(critter.isHealthy() && !(critter.isInjured())){
            //the user should receive an error for unnecessarily healing the critter
            logger.info("Healed unnecessarily");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter is neither sick nor injured");
        }

        boolean shouldSave = false;

        if(medicineType.equals(EnumMedicineType.BAND_AID.toString())){
            if(critter.isInjured()){
                critter.setInjured(false);
                critter.setInjuredSince(null);
            }
            else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not injured");
            }
        }
        if(medicineType.equals(EnumMedicineType.PILL.toString())){
            if(!(critter.isHealthy())){
                critter.setHealthy(true);
                critter.setSickSince(null);
            }
            else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not sick");
            }
        }
        critterRepository.save(critter);
    }

    //Helpers:
    @Transactional(readOnly = true)
    public Critter getOwnedCritter(int critterId, int ownerId) {
        Critter critter = critterRepository.findById(critterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Critter not found"));

        if (critter.getOwner() == null || critter.getOwner().getUserId() != ownerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this critter");
        }

        return critter;
    }


}
