package com.CuteComputerCritters.backend.api.scheduler;

import com.CuteComputerCritters.backend.api.helpers.CritterBroadcaster;
import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolution;
import com.CuteComputerCritters.backend.api.repository.CritterEvolutionRepository;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CritterSchedulerTest {

    @Mock
    private CritterRepository critterRepository;

    @Mock
    private CritterBroadcaster critterBroadcaster;

    @Mock
    private CritterEvolutionRepository critterEvolutionRepository;

    @InjectMocks
    private CritterScheduler critterScheduler;

    private Critter testCritter;
    private Instant now;

    @BeforeEach
    void setUp() {
        now = Instant.now();
        testCritter = new Critter();
        testCritter.setCritterId(1);
        testCritter.setActive(true);
        testCritter.setDead(false);
        testCritter.setLastInteractionTime(now.minus(Duration.ofMinutes(1)));
        testCritter.setTotalActiveTime(0L);
        testCritter.setHunger(50);
        testCritter.setHappiness(50);
        testCritter.setHealthy(true);

        // Setup base evolution stage
        CritterEvolution stage1 = new CritterEvolution();
        stage1.setStage(1.0);
        testCritter.setEvolutionStage(stage1);

        // Pre-mock common repository responses
        when(critterRepository.findById(anyInt())).thenReturn(Optional.of(testCritter));
    }

    @Test
    void processCritterDecay_shouldReduceHungerAndHappiness() {
        // Act
        critterScheduler.processCritterDecay(testCritter, now);

        // Assert
        assertEquals(49, testCritter.getHunger());
        assertEquals(49, testCritter.getHappiness());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void processCritterDecay_shouldEvolveAfter5Minutes() {
        // Arrange
        testCritter.setTotalActiveTime(300L); // 5 minutes
        testCritter.setWeight(13); // Will trigger 2.3 evolution path
        testCritter.setHasCalled(false); // Ensure consistent starting state

        CritterEvolution stage2_3 = new CritterEvolution();
        stage2_3.setStage(2.3);

        when(critterEvolutionRepository.findEvolutionByStage(2.3))
                .thenReturn(Optional.of(stage2_3));

        // Clear any previous interactions
        reset(critterBroadcaster);

        // Act
        critterScheduler.processCritterDecay(testCritter, now);

        // Assert
        assertEquals(2.3, testCritter.getEvolutionStage().getStage());
        verify(critterBroadcaster, atLeastOnce()).broadcast(any()); // More flexible verification
    }

    @Test
    void getSick_shouldMakeCritterSickWhenConditionsMet() {
        // Arrange
        Instant lastInteraction = now.minus(Duration.ofHours(1));
        testCritter.setLastInteractionTime(lastInteraction);
        testCritter.setTotalActiveTime(3600L); // 1 hour
        testCritter.setWeight(9); // Normal weight

        // Ensure we're at a 2-minute boundary (3600 % 120 == 0)
        assertTrue(Duration.between(lastInteraction, now).getSeconds() % 120 == 0,
                "Test should be set up on a 2-minute boundary");

        // Mock evolution
        CritterEvolution stage1 = new CritterEvolution();
        stage1.setStage(1.0);
        when(critterEvolutionRepository.findEvolutionByStage(anyDouble()))
                .thenReturn(Optional.of(stage1));

        // Mock random to trigger sickness (49 < 50)
        try (MockedStatic<ThreadLocalRandom> mockedRandom = mockStatic(ThreadLocalRandom.class)) {
            ThreadLocalRandom mockRandom = mock(ThreadLocalRandom.class);
            when(mockRandom.nextInt(100)).thenReturn(49);
            mockedRandom.when(ThreadLocalRandom::current).thenReturn(mockRandom);

            // Act
            critterScheduler.processCritterDecay(testCritter, now);

            // Assert
            assertFalse(testCritter.isHealthy(), "Critter should be sick");
            assertNotNull(testCritter.getSickSince(), "Sick timestamp should be set");

            // Verify no evolution occurred
            verify(critterEvolutionRepository, never()).findEvolutionByStage(2.3);
        }
    }

    @Test
    void processCritterDecay_shouldMarkDeadAfterTooManyCareMisses() {
        // Arrange
        testCritter.setCareMisses(10);

        // Act
        critterScheduler.processCritterDecay(testCritter, now);

        // Assert
        assertTrue(testCritter.isDead());
    }

    @Test
    void processCritterDecay_shouldHandleHungerZeroForTooLong() {
        // Arrange
        testCritter.setHunger(0);
        testCritter.setHungrySince(now.minus(Duration.ofMinutes(3)));

        // Act
        critterScheduler.processCritterDecay(testCritter, now);

        // Assert
        assertEquals(1, testCritter.getCareMisses());
        assertNull(testCritter.getHungrySince());
    }
}