//
//package com.CuteComputerCritters.backend.api.scheduler;
//
//import com.CuteComputerCritters.backend.api.model.Critter;
//import com.CuteComputerCritters.backend.api.repository.CritterRepository;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//import java.time.Duration;
//import java.time.Instant;
//import java.util.List;
//
//@Service
//public class CareMissScheduler {
//
//    private CritterRepository critterRepository;
//
//    public CareMissScheduler(CritterRepository critterRepository) {
//        this.critterRepository = critterRepository;
//    }
//    @Scheduled(fixedRate = 15000) // every minute is 60000
//    public void updateEvolutionStages() {
//
//        //find all active critters (decay only happens when critter is activated)
//        List<Critter> activeCritters = critterRepository.findByIsActiveTrueAndIsDeadFalse();
//
//        Instant now = Instant.now();
//
//        for (Critter critter : activeCritters) {
//            Instant lastInteraction = critter.getLastInteractionTime();
//            if (lastInteraction == null) continue;
//
//            long sessionSeconds = Duration.between(lastInteraction, now).getSeconds();
//
//            // Add session duration so far to totalActiveTime
//            critter.setTotalActiveTime(critter.getTotalActiveTime() + sessionSeconds);
//
//            // Update lastInteractionTime to now, so next run measures time from here
//            critter.setLastInteractionTime(now);
//
//            /*CAREMISSES*/
//
//
//            //if the owner has not responded after 5 minutes to the call, a care miss will be noted and it will get a 80% chance of being sick
//            Instant timeOfCall = critter.getCalledSince();
//            if(critter.isHasCalled() && critter.getCalledSince() != null){
//                Duration durationCallResponse = Duration.between(critter.getCalledSince(), now);
//                if(durationCallResponse.toMinutes() >= 5) {
//                    critter.setCareMisses(critter.getCareMisses() + 1);
//                    //reset timestamp
//                    critter.setCalledSince(null);
//                    System.out.println("CALL CAREMISSES: " + critter.getCareMisses());
//                }
//            }
//
//
//            //if the critter is sick and left unattended for longer than 10 minutes a care miss will be noted, if its sick for twenty it will die
//            if (!(critter.isHealthy()) && critter.getSickSince() != null){
//                Duration isSickAndUnattended = Duration.between(critter.getSickSince(), now);
//                if (isSickAndUnattended.toMinutes() >= 10){
//                    //note caremiss
//                    critter.setCareMisses(critter.getCareMisses() + 1);
//                    System.out.println("SICK CAREMISSES: " + critter.getCareMisses());
//                }
//                //if the critter is still sick for another 10min it will die
//                if (isSickAndUnattended.toMinutes() >= 20){
//                    critter.setDead(true);
//                    System.out.println("SICK DEATH!");
//                }
//            }
//
//            //unhappy and unattended
//            //set critter unhappySince to current time once it hits 0
//            if(critter.getHappiness() == 0){
//                critter.setUnhappySince(now);
//            }
//            if(critter.getHappiness() == 0 && critter.getUnhappySince() != null){
//                //check for the duration its been left unattended, if its longer than 10, note a care miss
//                Duration unhappyAndUnattended = Duration.between(critter.getUnhappySince(), now);
//                if(unhappyAndUnattended.toMinutes() >= 10) {
//                    //note caremiss
//                    critter.setCareMisses(critter.getCareMisses() + 1);
//                    //reset timestamp
//                    critter.setUnhappySince(null);
//                    System.out.println("UNHAPPY CAREMISSES: " + critter.getCareMisses());
//                }
//            }
//
//
//            //hungry and unattended
//            //set critter hungrySince to current timestamp once it hits 0
//            if(critter.getHunger() == 0){
//                critter.setHungrySince(now);
//            }
//            //check for the duration its been left unattended, if longer than 10, note a care miss
//            if(critter.getHunger() == 0 && critter.getHungrySince() != null){
//                Duration hungryAndUnattended = Duration.between(critter.getHungrySince(), now);
//                if(hungryAndUnattended.toMinutes() >= 10) {
//                    //note caremiss
//                    critter.setCareMisses(critter.getCareMisses() + 1);
//                    //reset timestamp
//                    critter.setHungrySince(null);
//                    System.out.println("HUNGRY CAREMISSES: " + critter.getCareMisses());
//                }
//            }
//
//            //if the critter is at 15 care misses it will die
//            if(critter.getCareMisses() >= 15){
//                System.out.println("DEATH CAREMISSES: " + critter.getCareMisses());
//                critter.setDead(true);
//            }
//        }
//
//        critterRepository.saveAll(activeCritters);
//    }
//
//}