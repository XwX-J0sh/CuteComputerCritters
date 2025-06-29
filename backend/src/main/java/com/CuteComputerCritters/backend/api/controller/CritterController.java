package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.Critter;
import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.request.critter.CritterUpdateRequest;
import com.CuteComputerCritters.backend.api.payload.request.critter.NewCritterRequest;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import com.CuteComputerCritters.backend.api.repository.MedicineRepository;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import com.CuteComputerCritters.backend.api.service.CritterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/critter")
public class CritterController {

    private final CritterService critterService;
    private final UserRepository userRepository;
    private final CritterRepository critterRepository;
    private final FoodRepository foodRepository;
    final int MAX_STAT = 10;
    final int MAX_WEIGHT = 30;
    final int MIN_WEIGHT = 1;
    final int MIN_STAT = 0;
    private final MedicineRepository medicineRepository;

    //create critter
    @PostMapping("/new")
    public ResponseEntity<?> createNewCritter (Authentication authentication, @RequestBody NewCritterRequest newCritterRequest) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //Create new Critter
        Critter critter = new Critter();
        critter.setOwner(owner);
        critter.setCritterName(newCritterRequest.getCritterName());
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
        critter.setEvolution(1.0);
        critter.setSleepCycleDuration(30);
        critter.setSleepDuration(5);
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
        critter.setLightIsOn(false);
        critter.setLightOnSince(null);
        critter.setCalledSince(null);
        critter.setDecayRateHunger(1);
        critter.setDecayRateHappy(1);
        critter.setSicknessChance(50);
        critter.setCallChance(50);
        critter.setTrainingFactor(1);
        critterRepository.save(critter);

        CritterGetResponse response = mapToResponse(critter, owner);

        return ResponseEntity.ok(response);
    }

    //update critter (identified by id)
    @PatchMapping("/{critterId}")
    public ResponseEntity<?> updateCritter (Authentication authentication, @PathVariable int critterId,@RequestBody CritterUpdateRequest critterUpdateRequest) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user:
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        // Apply only provided updates
        if (critterUpdateRequest.getHunger() != null) critter.setHunger(critterUpdateRequest.getHunger());
        if (critterUpdateRequest.getHappiness() != null) critter.setHappiness(critterUpdateRequest.getHappiness());
        if (critterUpdateRequest.getTraining() != null) critter.setTraining(critterUpdateRequest.getTraining());
        if (critterUpdateRequest.getWeight() != null) critter.setWeight(critterUpdateRequest.getWeight());
        if (critterUpdateRequest.getIsHealthy() != null) critter.setHealthy(critterUpdateRequest.getIsHealthy());
        if (critterUpdateRequest.getCanDefend() != null) critter.setCanDefend(critterUpdateRequest.getCanDefend());
        if (critterUpdateRequest.getEvolution() != null) critter.setEvolution(critterUpdateRequest.getEvolution());
        if (critterUpdateRequest.getIsAsleep() != null) critter.setAsleep(critterUpdateRequest.getIsAsleep());
        if (critterUpdateRequest.getCareMisses() != null) critter.setCareMisses(critterUpdateRequest.getCareMisses());
        if (critterUpdateRequest.getHasCalled() != null) critter.setHasCalled(critter.isHasCalled());
        if (critterUpdateRequest.getIsInjured() != null) critter.setInjured(critter.isInjured());

        critterRepository.save(critter);

        return ResponseEntity.ok("Critter updated");
    }

    //get critter (by id) :
    @GetMapping("/{critterId}")
    public ResponseEntity<?> getCritterbyId(Authentication authentication, @PathVariable int critterId) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        CritterGetResponse response = mapToResponse(critter, owner);

        return ResponseEntity.ok(response);
    }

    //get all critters of the user
    @GetMapping("/all")
    public ResponseEntity<?> getAllCrittersForUser(Authentication authentication) {
        //Authenticate and get the owner (User)
        User owner = authenticateAndGetUser(authentication);

        //retrieve all critters owned by the user
        List<Critter> critters = critterRepository.findByOwner_UserId(owner.getUserId());

        //format response
        List<CritterGetResponse> responses = critters.stream()
                .map(c -> {
                    CritterGetResponse response = mapToResponse(c, owner);
                    return response;
                })
                .toList();

        return ResponseEntity.ok(responses);
    }

    //delete critter by id
    @DeleteMapping("/{critterId}")
    public ResponseEntity<?> deleteCritter(@PathVariable int critterId, Authentication authentication) {

        // Authenticate and get the owner
        User owner = authenticateAndGetUser(authentication);

        // Get the critter if owned by the user
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        // Delete the critter
        critterRepository.delete(critter);

        return ResponseEntity.ok("Critter deleted successfully");
    }



    /* GAME MECHANICS */




    //activate a critter (start playing)
    @PostMapping("/{critterId}/start")
    public ResponseEntity<?> startPlaying(@PathVariable int critterId, Authentication authentication) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user:
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        critter.setActive(true);
        critterRepository.save(critter);

        return ResponseEntity.ok("Critter activated");
    }

    //pause a critter (stop playing)
    @PostMapping("/{critterId}/stop")
    public ResponseEntity<?> stopPlaying(@PathVariable int critterId, Authentication authentication) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user:
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        critter.setActive(false);
        critter.setLastInteractionTime(Instant.now());
        critterRepository.save(critter);

        return ResponseEntity.ok("Critter paused");
    }

    //feed critter with food
    @PatchMapping("/{critterId}/feed/{foodName}")
    public ResponseEntity<?> feedCritter (Authentication authentication, @PathVariable int critterId, @PathVariable String foodName) {

        //authenticate the request and get the Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        //check if the critter is even hungry to begin with
        //if the critter is full, hand back the err: Critter not hungry
        if (critter.getHunger() == 10){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not hungry!");
        }

        //get the food that is being fed to the critter
        Food food = foodRepository.findByFoodName(foodName);

        //set new satiation of the fed
        int satiation = food.getSatiation();
        int newHunger = Math.min(critter.getHunger() + satiation, MAX_STAT);
        critter.setHunger(newHunger);

        /*set new Happiness depending on, whether the pet has eaten a snack and how much happiness
         * it gets from being fed snacks (Usagi (evolution 2.3) and Momonga (evolution 2.4) enjoy it more */
        if (food.getFoodType().toString().equals("SNACK")) {

            int newHappiness;
            //if its Usagi or Momonga
            if(critter.getEvolution() < 2.3){
                newHappiness = Math.min(critter.getHappiness() + (int) (food.getSatiation() * 1.5), MAX_STAT);
            }
            else {
                newHappiness = Math.min(critter.getHappiness() + food.getSatiation(), MAX_STAT);
            }

            //also update the snackCounter for the critter
            critter.setSnackCounter(critter.getSnackCounter() + 1);
            critter.setHappiness(newHappiness);
        } else {
            //update meal counter
            critter.setMealCounter(critter.getMealCounter() + 1);
        }

        //save the counters so that the weight can be accurately accounted for later
        critterRepository.save(critter);

        //for every three snacks the critter is fed, it will gain weight; that's why the snack counter had to be saved earlier
        if(critter.getSnackCounter() % 3 == 0 && critter.getSnackCounter() != 0){
            int newWeight = Math.min(critter.getWeight() + 6, MAX_WEIGHT);
        }

        //conversely for every three meals the critter is fed, it gains weight as well (though slower)
        if(critter.getMealCounter() % 3 == 0 && critter.getMealCounter() != 0){
            int newWeight = Math.min(critter.getWeight() + 5, MAX_WEIGHT);
        }

        critterRepository.save(critter);

        return ResponseEntity.ok("Critter fed!");
    }

    /*train/play with the critter (note the trainingvalue assigns how much
    training a mini game has given the pet. It is dependent on the score the User receives on the game,
    higher being better than lower*/
    @PatchMapping("/{critterId}/train/{trainingValue}")
    public ResponseEntity<?> trainCritter(
            Authentication authentication,
            @PathVariable int critterId, @PathVariable int trainingValue) {

        User owner = authenticateAndGetUser(authentication);
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        int newHappiness;
        int newTrainingValue;

        /* Critters before stage 2 receive a different amount of training and happiness from play
         * than older evolutions*/

        if(critter.getEvolution() < 2) {
            //children learn faster and are happier with learning/play
            newHappiness = Math.min(critter.getHappiness() + trainingValue, MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + trainingValue, MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);
        } else if (critter.getEvolution() == 2.0) {
            //adults learn slower and are less enthusiastic (standard stats for adults/Chiikawa)
            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/2), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/2), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);
        } else if (critter.getEvolution() == 2.1) {
            /*Hachiware is just really playful so happiness grows at a rate as fast as with kids
             * training/learning value is similair to standard adults though (Chiikawa)*/

            newHappiness = Math.min(critter.getHappiness() + trainingValue, MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/2), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);
        } else if (critter.getEvolution() == 2.2) {
            /*similair case as with Hachiware except the other way around
             * Schisa is well behaved so their training stats grow as fast as that of kids
             * happiness is similair to standard though*/

            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/2), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + trainingValue, MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);
        }
        else {
            /* Usagi and Momonga do not enjoy training*/
            newHappiness = Math.min(critter.getHappiness() + (int)(trainingValue/3), MAX_STAT);
            newTrainingValue = Math.min(critter.getTraining() + (int)(trainingValue/3), MAX_STAT);

            critter.setHappiness(newHappiness);
            critter.setTraining(newTrainingValue);
        }

        critterRepository.save(critter);

        return ResponseEntity.ok("Critter trained!");
    }

    //if the critter has Called, the user should respond by calling upon the endpoint
    @PatchMapping("/{critterId}/respond")
    public ResponseEntity<?> respondToCall (@PathVariable int critterId, Authentication authentication) {
        //authenticate and get user (owner)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by User
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        if(!(critter.isHasCalled())){
            //if the critter did not call but the User responded:
            System.out.println("Responded unnecessarily");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter did not call");
        }

        critter.setHasCalled(false);

        return ResponseEntity.ok("Responded to call");
    }

    //if the critter is injured or sick, the User should heal it via band-aids or pills
    @PatchMapping("/{critterId}/heal/{medicineType}")
    public ResponseEntity<?> heal (@PathVariable int critterId, Authentication authentication, @PathVariable String medicineType) {
        //authenticate and get user (owner)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by User
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        //if the critter is healthy and uninjured
        if(critter.isHealthy() && !(critter.isInjured())){
            //the user should receive an error for unnecessarily healing the critter
            System.out.println("Healed unnecessarily");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter is neither sick nor injured");
        }

        if(medicineType.equals("BAND_AID")){
            if(critter.isInjured()){
                critter.setInjured(false);
                critter.setInjuredSince(null);
                return ResponseEntity.ok("Healed injury");
            }
            else {
                critter.setHappiness(Math.max(critter.getHappiness() - 1, 0));
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not injured");
            }
        }
        if(medicineType.equals("PILLS")){
            if(!(critter.isHealthy())){
                critter.setHealthy(true);
                critter.setSickSince(null);
                return ResponseEntity.ok("Healed sickness");
            }
            else {
                critter.setHappiness(Math.min(critter.getHappiness() - 2, 0));
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Critter not sick");
            }
        }

        return ResponseEntity.ok("Responded to injury/sickness");
    }

    //HELPERS:
    // authenticate and get User entity (owner)
    private User authenticateAndGetUser(Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Critter getCritterIfOwnedByUser(int critterId, int ownerId) {
        Critter critter = critterRepository.findById(critterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Critter not found"));

        if (critter.getOwner() == null || critter.getOwner().getUserId() != ownerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this critter");
        }

        return critter;
    }

    //map the critter and its owner's info to the response
    public static CritterGetResponse mapToResponse(Critter critter, User owner) {
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