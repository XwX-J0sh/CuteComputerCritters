package com.CuteComputerCritters.backend.api.scheduler;

import com.CuteComputerCritters.backend.api.helpers.CritterBroadcaster;
import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolutions;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.CritterEvolutionsRepository;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class CritterScheduler {

    private final CritterRepository critterRepository;
    private final CritterBroadcaster critterBroadcaster;
    private final CritterEvolutionsRepository critterEvolutionsRepository;

    public CritterScheduler(CritterRepository critterRepository, CritterBroadcaster critterBroadcaster, CritterEvolutionsRepository critterEvolutionsRepository) {
        this.critterRepository = critterRepository;
        this.critterBroadcaster = critterBroadcaster;
        this.critterEvolutionsRepository = critterEvolutionsRepository;
    }

    //scheduled to update every minute
    @Scheduled(fixedRate = 60000)
    public void updateEvolutionStagesAndDecayStats() {

        List<Critter> activeCritters = critterRepository.findByIsActiveTrueAndIsDeadFalse();
        Instant now = Instant.now();

        for (Critter critter : activeCritters) {
            try {
                processCritterDecay(critter, now);
            } catch (OptimisticLockException e) {
                log.warn("Skipped Critter {} due to concurrent modification.", critter.getCritterId());
            } catch (Exception e) {
                log.error("Unexpected error while processing Critter {}: {}", critter.getCritterId(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void processCritterDecay(Critter critter, Instant now) {
        Instant processingStart = Instant.now();
        log.debug("Scheduler started at {}", processingStart);

        // Refresh from DB to avoid stale version
        Critter freshCritter = critterRepository.findById(critter.getCritterId())
                .orElseThrow(() -> new IllegalStateException("Critter not found"));

        Instant lastInteraction = freshCritter.getLastInteractionTime();
        if (lastInteraction == null) return;

        long sessionSeconds = Duration.between(lastInteraction, now).getSeconds();
        freshCritter.setTotalActiveTime(freshCritter.getTotalActiveTime() + sessionSeconds);
        freshCritter.setLastInteractionTime(now);

        int evolutionStage = (int) freshCritter.getEvolutionStage().getStage();

        int hungerDecay = 1;
        int happinessDecay = 1;
        int chanceOfSickness = 50;
        int chanceOfCall = 50;

        //after two minutes the critter gets sick
        if (evolutionStage == 1 && freshCritter.getTotalActiveTime() >= 120000) {
            freshCritter.setHealthy(false);
        }

        //call after one minute DEBUG
        if (evolutionStage == 1 && freshCritter.getTotalActiveTime() >= 60000) {
            critter.setHasCalled(true);
            critter.setCalledSince(now);
            log.info("Critter {} has called! (DEBUG)", critter.getCritterId());
        }

        // Evolution
        CritterEvolutions currentEvolution = freshCritter.getEvolutionStage();

        //after five minutes the critter enters the next evolutionary stage
        if (currentEvolution != null) {
            int currentStage = (int) currentEvolution.getStage();

            if (currentStage == 1 && freshCritter.getTotalActiveTime() >= 300000) {
                double nextStage;
                freshCritter.setTraining(0);

                if (freshCritter.getCareMisses() >= 6) {
                    nextStage = 2.4; // Momonga
                } else if (freshCritter.getWeight() > 12 || freshCritter.getWeight() < 6) {
                    nextStage = 2.3; // Usagi
                } else if (freshCritter.isCanDefend() && freshCritter.getTrainingSessions() > 5) {
                    nextStage = 2.2; // Shisa
                } else if (!freshCritter.isCanDefend() && freshCritter.getTrainingSessions() > 5) {
                    nextStage = 2.1; // Hachiware
                } else {
                    nextStage = 2.0; // Chiikawa (standard)
                }

                // Fetch the new evolution entity
                CritterEvolutions newEvolution = critterEvolutionsRepository.findEvolutionByStage(nextStage)
                        .orElseThrow(() -> new IllegalStateException("Evolution stage " + nextStage + " not found"));

                freshCritter.setEvolutionStage(newEvolution);
                log.info("Critter {} evolved to stage {}", freshCritter.getCritterId(), nextStage);
            }
        }


        //if the critter has called and the User does not answer after 2min, a care miss will be noted
        if (freshCritter.isHasCalled() && freshCritter.getCalledSince() != null) {
            Duration callDuration = Duration.between(freshCritter.getCalledSince(), now);
            if (callDuration.toMinutes() >= 2) {
                freshCritter.setCareMisses(freshCritter.getCareMisses() + 1);
                freshCritter.setCalledSince(null); // Reset
                freshCritter.setHasCalled(false); // Reset
                log.info("Critter {} missed a call!", freshCritter.getCritterId());
            }
        }

        //if the critter gets sick and the User does not heal it within 3min a care miss will be noted
        //if its still sick after another 3min, it will die
        if (!freshCritter.isHealthy() && freshCritter.getSickSince() != null) {
            Duration sickDuration = Duration.between(freshCritter.getSickSince(), now);
            if (sickDuration.toMinutes() >= 3) {
                freshCritter.setCareMisses(freshCritter.getCareMisses() + 1);
                log.info("Critter {} was sick and unattended.", freshCritter.getCritterId());
            }
            if (sickDuration.toMinutes() >= 6) {
                freshCritter.setDead(true);
                log.warn("Critter {} died from sickness!", freshCritter.getCritterId());
            }
        }

        //if the critter has hit 0 Happiness for 3min a care miss will be noted
        if (freshCritter.getHappiness() == 0 && freshCritter.getUnhappySince() == null) {
            freshCritter.setUnhappySince(now);
        }
        if (freshCritter.getHappiness() == 0 && freshCritter.getUnhappySince() != null) {
            Duration unhappyDuration = Duration.between(freshCritter.getUnhappySince(), now);
            if (unhappyDuration.toMinutes() >= 3) {
                freshCritter.setCareMisses(freshCritter.getCareMisses() + 1);
                freshCritter.setUnhappySince(null);
                log.info("Critter {} was unhappy and unattended.", freshCritter.getCritterId());
            }
        } else {
            freshCritter.setUnhappySince(null); // Reset if happiness improved
        }

        //if the critter hits hunger 0 for 2min a care miss will be noted
        if (freshCritter.getHunger() == 0 && freshCritter.getHungrySince() == null) {
            freshCritter.setHungrySince(now);
        }
        if (freshCritter.getHunger() == 0 && freshCritter.getHungrySince() != null) {
            Duration hungryDuration = Duration.between(freshCritter.getHungrySince(), now);
            if (hungryDuration.toMinutes() >= 2) {
                freshCritter.setCareMisses(freshCritter.getCareMisses() + 1);
                freshCritter.setHungrySince(null);
                log.info("Critter {} was hungry and unattended.", freshCritter.getCritterId());
            }
        } else {
            freshCritter.setHungrySince(null); // Reset if hunger improved
        }

        //if the critter hits more than 10 care misses it will die
        if (freshCritter.getCareMisses() >= 1) {
            freshCritter.setDead(true);
            log.warn("Critter {} died due to care misses!", freshCritter.getCritterId());
        }

        //lower the hunger stats (DECAY)
        int newHunger = Math.max(freshCritter.getHunger() - hungerDecay, 0);
        int newHappiness = Math.max(freshCritter.getHappiness() - happinessDecay, 0);

        //randomly make the critter call out/sick
        getSick(freshCritter, chanceOfSickness, now);
        maybeCall(freshCritter, chanceOfCall, now);


        //set and save the changes
        freshCritter.setHunger(newHunger);
        freshCritter.setHappiness(newHappiness);
        critterRepository.save(freshCritter);

        //broadcast (for websockets)
        CritterGetResponse response = CritterGetResponse.fromEntity(freshCritter);
        critterBroadcaster.broadcast(response);

        log.debug("Scheduler completed in {}ms",
                Duration.between(processingStart, Instant.now()).toMillis());
    }

    //Helpers
    private boolean shouldHappen(int chanceOfEvent) {
        int random = ThreadLocalRandom.current().nextInt(100);
        return random < chanceOfEvent;
    }

    private void getSick(Critter critter, int chanceOfSickness, Instant now) {
        if (critter.isHealthy() && shouldHappen(chanceOfSickness) && critter.getTotalActiveTime() % 3600 == 0) {
            critter.setHealthy(false);
            critter.setSickSince(now);
            log.info("Critter {} is now sick.", critter.getCritterId());
        }
    }

    private void maybeCall(Critter critter, int chanceOfCall, Instant now) {
        if (critter.isHasCalled()) return;

        Duration timeSinceLastCall = critter.getCalledSince() == null
                ? Duration.ofMinutes(5)
                : Duration.between(critter.getCalledSince(), now);

        if (shouldHappen(chanceOfCall) && timeSinceLastCall.toMinutes() >= 5) {
            critter.setHasCalled(true);
            critter.setCalledSince(now);
            log.info("Critter {} has called!", critter.getCritterId());

            //immediately push update to frontend
            CritterGetResponse response = CritterGetResponse.fromEntity(critter);
            critterBroadcaster.broadcast(response);
        }
    }

}
