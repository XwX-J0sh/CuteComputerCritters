package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.helpers.CritterBroadcaster;
import com.CuteComputerCritters.backend.api.helpers.CritterMapper;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.request.critter.CritterUpdateRequest;
import com.CuteComputerCritters.backend.api.payload.request.critter.NewCritterRequest;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import com.CuteComputerCritters.backend.api.service.CritterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/critter")
public class CritterController {

    private final CritterService critterService;
    private final UserRepository userRepository;
    private final CritterBroadcaster critterBroadcaster;
    private final CritterMapper critterMapper;

    //create critter
    @PostMapping("/new")
    public ResponseEntity<?> createNewCritter(Authentication authentication, @RequestBody NewCritterRequest newCritterRequest) {
        User owner = authenticateAndGetUser(authentication);
        CritterGetResponse response = critterService.createNewCritter(newCritterRequest, owner);
        critterBroadcaster.broadcast(response);
        System.out.println("New critter created");
        return ResponseEntity.ok(response);
    }

    //update critter (identified by id)
    @PatchMapping("/{critterId}")
    public ResponseEntity<?> updateCritter (Authentication authentication, @PathVariable int critterId,@RequestBody CritterUpdateRequest critterUpdateRequest) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        critterService.updateCritter(critterId, owner.getUserId(), critterUpdateRequest);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id " + critterId + " updated");
        return ResponseEntity.ok(response);
    }

    //get critters by id
    @GetMapping("/{critterId}")
    public ResponseEntity<?> getCritterById(Authentication auth, @PathVariable int critterId) {
        User owner = authenticateAndGetUser(auth);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id " + critterId + " retrieved");
        return ResponseEntity.ok(response);
    }

    //get all critters
    @GetMapping("/all")
    public ResponseEntity<?> getAllCritters(Authentication auth) {
        User owner = authenticateAndGetUser(auth);
        System.out.println("All critters retrieved");
        return ResponseEntity.ok(critterService.getAllCrittersForUser(owner));
    }

    //delete critter by id
    @DeleteMapping("/{critterId}")
    public ResponseEntity<?> deleteCritter(@PathVariable int critterId, Authentication authentication) {

        // Authenticate and get the owner
        User owner = authenticateAndGetUser(authentication);
        System.out.println("Critter with id " + critterId + " deleted");
        critterService.deleteCritter(owner.getUserId(), critterId);
        return ResponseEntity.ok("Critter deleted successfully");
    }



    /* GAME MECHANICS */




    //activate a critter (start playing)
    @PostMapping("/{critterId}/start")
    public ResponseEntity<?> startPlaying(@PathVariable int critterId, Authentication authentication) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        critterService.startPlaying(owner.getUserId(), critterId);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id " + critterId + " activated");
        return ResponseEntity.ok(response);
    }

    //pause a critter (stop playing)
    @PostMapping("/{critterId}/stop")
    public ResponseEntity<?> stopPlaying(@PathVariable int critterId, Authentication authentication) {

        //authenticate the request and get Owner (User)
        User owner = authenticateAndGetUser(authentication);

        critterService.stopPlaying(owner.getUserId(), critterId);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id " + critterId + " deactivated");
        return ResponseEntity.ok(response);
    }

    //feed critter with food
    @PostMapping("/{critterId}/feed/{foodName}")
    public ResponseEntity<?> feedCritter(
            Authentication authentication,
            @PathVariable int critterId,
            @PathVariable String foodName) {

        User owner = authenticateAndGetUser(authentication);
        critterService.feedCritter(owner.getUserId(), critterId, foodName);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id " + critterId + " fed with " + foodName);
        return ResponseEntity.ok(response);
    }


    /*train/play with the critter (note the trainingvalue assigns how much
    training a mini game has given the pet. It is dependent on the score the User receives on the game,
    higher being better than lower*/
    @PatchMapping("/{critterId}/train/{trainingValue}")
    public ResponseEntity<?> trainCritter(
            Authentication authentication,
            @PathVariable int critterId, @PathVariable int trainingValue) {

        //authenticate user and get owner
        User owner = authenticateAndGetUser(authentication);

        //trainCritter
        critterService.trainCritter(critterId, owner.getUserId(), trainingValue);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id" + critterId + " trained by Value " + trainingValue);
        return ResponseEntity.ok(response);
    }

    //if the critter has Called, the user should respond by calling upon the endpoint
    @PatchMapping("/{critterId}/respond")
    public ResponseEntity<?> respondToCall (@PathVariable int critterId, Authentication authentication) {
        //authenticate and get user (owner)
        User owner = authenticateAndGetUser(authentication);

        //respond to call (set hasCalled to false again)
        critterService.respondToCall(critterId, owner.getUserId());
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id" + critterId + " was responded to");
        return ResponseEntity.ok(response);
    }

    //if the critter is injured or sick, the User should heal it via band-aids or pills
    @PatchMapping("/{critterId}/heal/{medicineType}")
    public ResponseEntity<?> heal (@PathVariable int critterId, Authentication authentication, @PathVariable String medicineType) {
        //authenticate and get user (owner)
        User owner = authenticateAndGetUser(authentication);

        critterService.healCritter(critterId, owner.getUserId(), medicineType);
        CritterGetResponse response = broadcast(critterId, owner);
        System.out.println("Critter with id" + critterId + " healed with " + medicineType);
        return ResponseEntity.ok(response);
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

    //broadcast so that Websockets can emit
    private CritterGetResponse broadcast(int critterId, User owner) {
        CritterGetResponse response = critterMapper.mapToResponse(
                critterService.getOwnedCritter(critterId, owner.getUserId()), owner);
        critterBroadcaster.broadcast(response);
        return response;
    }
}