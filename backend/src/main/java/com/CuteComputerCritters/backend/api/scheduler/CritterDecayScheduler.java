package com.CuteComputerCritters.backend.api.scheduler;

import com.CuteComputerCritters.backend.api.model.Critter;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class CritterDecayScheduler {

    private CritterRepository critterRepository;

    public CritterDecayScheduler(CritterRepository critterRepository) {
        this.critterRepository = critterRepository;
    }

    @Scheduled(fixedRate = 15000) // every minute is 60000
    public void updateEvolutionStages() {

        List<Critter> activeCritters = critterRepository.findByIsActiveTrue();

        Instant now = Instant.now();

        for (Critter critter : activeCritters) {
            Instant lastInteraction = critter.getLastInteractionTime();
            if (lastInteraction == null) continue;

            long sessionSeconds = Duration.between(lastInteraction, now).getSeconds();

            // Add session duration so far to totalActiveTime
            critter.setTotalActiveTime(critter.getTotalActiveTime() + sessionSeconds);

            // Update lastInteractionTime to now, so next run measures time from here
            critter.setLastInteractionTime(now);

            // Update/get evolution
            int evolutionStage = (int) critter.getEvolution();


            //Decay rates for evolution 1
            int hungerDecay = 1;
            int happinessDecay = 1;


            //after 1 hr hit evolution stage 2
            if ((evolutionStage == 1) && critter.getTotalActiveTime() >= 3600) {
                if (critter.getCareMisses() >= 4){
                    //if the player hits more than four care misses they receive Momonga
                    critter.setEvolution(2.4);
                } else if (critter.getWeight() > 12 || critter.getWeight() < 6) {
                    //if the critters weight is unhealthy (ie its been eating bad) the User gets Usagi
                    critter.setEvolution(2.3);

                } else if (critter.isCanDefend() && critter.getTrainingSessions() > 5){
                    //if the critter is well trained --> can defend itself and has been trained more than 5 times the user gets Schisa
                    critter.setEvolution(2.2);
                } else if(!(critter.isCanDefend()) && critter.getTrainingSessions() > 5){
                    //if its been trained/played with a lot (more than five times) but cannot defend itself, the suer gets Hachiware
                    critter.setEvolution(2.1);
                }
                else {
                    //if none of those apply and the pet has neithe rbeen terribly treated nor well, the user gets standard (Chiikawa)
                    critter.setEvolution(2.0);
                }
            }

            //decay
            int newHunger = Math.max(critter.getHunger() - hungerDecay, 0);
            int newHappiness = Math.max(critter.getHappiness() - happinessDecay, 0);

            System.out.println("New Hunger: " + newHunger);
            System.out.println("New Happiness: " + newHappiness);
            critter.setHunger(newHunger);
            critter.setHappiness(newHappiness);
        }

        critterRepository.saveAll(activeCritters);
    }

}