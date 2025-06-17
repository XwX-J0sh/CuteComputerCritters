package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.Critter;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.request.critter.CritterUpdateRequest;
import com.CuteComputerCritters.backend.api.payload.request.critter.NewCritterRequest;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
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
        critter.setTraining(10);
        critter.setWeight(1);
        critter.setHealthy(true);
        critter.setCanDefend(false);
        critter.setEvolution(1.0f);
        critter.setSleepCycleDuration(10);
        critter.setSleepDuration(60);
        critter.setAsleep(false);
        critter.setActive(false);
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

        critterRepository.save(critter);

        return ResponseEntity.ok("Critter updated");
    }

    //get critter (by id) :
    @GetMapping("/{critterId}")
    public ResponseEntity<?> getCritterbyId(Authentication authentication, @PathVariable int critterId) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        //get critter if owned by user:
        Critter critter = getCritterIfOwnedByUser(critterId, owner.getUserId());

        CritterGetResponse response = mapToResponse(critter, owner);

        return ResponseEntity.ok(response);
    }

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
        critterRepository.save(critter);

        return ResponseEntity.ok("Critter paused");
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

    //map the critter and its owner's info too the response
    public static CritterGetResponse mapToResponse(Critter critter, User owner) {
        CritterGetResponse response = new CritterGetResponse();
        response.setCritterId(critter.getCritterId());
        response.setCritterName(critter.getCritterName());
        response.setCreatedAt(critter.getCreatedAt());
        response.setHunger(critter.getHunger());
        response.setHappiness(critter.getHappiness());
        response.setTraining(critter.getTraining());
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
        response.setActive(critter.isActive());
        response.setOwnerUsername(owner.getUsername());
        response.setOwnerId(owner.getUserId());
        return response;
    }
}