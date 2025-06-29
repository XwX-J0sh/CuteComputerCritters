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
//import java.util.concurrent.ThreadLocalRandom;
//
//@Service
//public class CritterDecayScheduler {
//
//    private CritterRepository critterRepository;
//
//    public CritterDecayScheduler(CritterRepository critterRepository) {
//        this.critterRepository = critterRepository;
//    }
//
//    @Scheduled(fixedRate = 15000) // every minute is 60000
//    public void updateEvolutionStagesAndDecayStats() {
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
//            // Update/get evolution
//            int evolutionStage = (int) critter.getEvolution();
//
//
//            //Decay rates for evolution 1
//            int hungerDecay = 1;
//            int happinessDecay = 1;
//            int chanceOfSickness = 50;
//            int chanceOfCall = 50;
//
//            //After first 30min pet gets sick once to introduce the sickness game mechanic
//            if(evolutionStage == 1 && critter.getTotalActiveTime() >= 1800) {
//                critter.setHealthy(false);
//            }
//
//            //after 1 hr hit evolution stage 2
//            if ((evolutionStage == 1) && critter.getTotalActiveTime() >= 3600) {
//                if (critter.getCareMisses() >= 4){
//                    /* if the player hits more than four care misses they receive Momonga
//                    * Momonga is bratty and needy, and gets hungrier/unhappy/sick faster/more often */
//                    critter.setEvolution(2.4);
//                    hungerDecay = 2;
//                    happinessDecay = 3;
//                    chanceOfSickness = 60;
//                    chanceOfCall = 70;
//
//                } else if (critter.getWeight() > 12 || critter.getWeight() < 6) {
//                    /* if the critters weight is unhealthy (i.e. it's been eating bad) the User gets Usagi
//                    * Usagi loves food and gets hungrier faster, because of the overeating they get sick more often as well*/
//
//                    critter.setEvolution(2.3);
//                    chanceOfSickness = 50;
//                    chanceOfCall = 50;
//
//                } else if (critter.isCanDefend() && critter.getTrainingSessions() > 5){
//                    //if the critter is well trained --> can defend itself and has been trained more than 5 times the user gets Schisa
//
//                    critter.setEvolution(2.2);
//                    chanceOfSickness = 20;
//                    chanceOfCall = 20;
//
//                } else if(!(critter.isCanDefend()) && critter.getTrainingSessions() > 5){
//                    //if its been trained/played with a lot (more than five times) but cannot defend itself, the suer gets Hachiware
//
//                    critter.setEvolution(2.1);
//                    chanceOfSickness = 35;
//                    chanceOfCall = 35;
//                }
//                else {
//                    //if none of those apply and the pet has neither been terribly treated nor well, the user gets standard (Chiikawa)
//
//                    critter.setEvolution(2.0);
//                    chanceOfSickness = 40;
//                    chanceOfCall = 40;
//                }
//            }
//
//            //decay stats
//            int newHunger = Math.max(critter.getHunger() - hungerDecay, 0);
//            int newHappiness = Math.max(critter.getHappiness() - happinessDecay, 0);
//
//            //getting sick (runs every hour)
//            getSick(critter, chanceOfSickness);
//
//            Duration timeSinceLastCall;
//
//            if (critter.getCalledSince() != null) {
//                timeSinceLastCall = Duration.between(critter.getCalledSince(), now);
//            } else {
//                // If never called before, allow it to call immediately
//                timeSinceLastCall = Duration.ofHours(2);
//            }
//
//            if (!critter.isHasCalled()
//                    && shouldHappen(chanceOfCall)
//                    && timeSinceLastCall.toMinutes() >= 120) {
//
//                critter.setHasCalled(true);
//                critter.setCalledSince(now);
//                critter.setCalledSince(now);
//                System.out.println("Your critter has called!");
//            }
//
//            System.out.println("New Hunger: " + newHunger);
//            System.out.println("New Happiness: " + newHappiness);
//            critter.setHunger(newHunger);
//            critter.setHappiness(newHappiness);
//        }
//
//        critterRepository.saveAll(activeCritters);
//    }
//
//    //Helpers
//    private boolean shouldHappen(int chanceOfEvent) {
//        int random = ThreadLocalRandom.current().nextInt(100);
//        return random < chanceOfEvent;
//    }
//
//    private void getSick(Critter critter, int chanceOfSickness){
//        if (critter.isHealthy() && shouldHappen(chanceOfSickness) && (critter.getTotalActiveTime() % 3600000) == 0) {
//            critter.setHealthy(false);
//            System.out.println("Your critter is sick!");
//            critter.setSickSince(Instant.now());
//        }
//    }
//
//}