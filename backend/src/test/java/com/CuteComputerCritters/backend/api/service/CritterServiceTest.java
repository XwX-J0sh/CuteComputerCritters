package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.helpers.CritterMapper;
import com.CuteComputerCritters.backend.api.model.Critter.Critter;
import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolution;
import com.CuteComputerCritters.backend.api.model.Food.EnumFoodType;
import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType;
import com.CuteComputerCritters.backend.api.payload.request.critter.CritterUpdateRequest;
import com.CuteComputerCritters.backend.api.payload.request.critter.NewCritterRequest;
import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import com.CuteComputerCritters.backend.api.repository.CritterEvolutionRepository;
import com.CuteComputerCritters.backend.api.repository.CritterRepository;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CritterServiceTest {

    @Mock
    private CritterRepository critterRepository;

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private CritterEvolutionRepository critterEvolutionRepository;

    @Mock
    private CritterMapper critterMapper;

    @InjectMocks
    private CritterService critterService;

    private User testUser;
    private Critter testCritter;
    private CritterEvolution baseStage;
    private CritterEvolution adultStage;
    private Food testMeal;
    private Food testSnack;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1);

        baseStage = new CritterEvolution();
        baseStage.setStage(1.0);

        adultStage = new CritterEvolution();
        adultStage.setStage(2.0);

        testCritter = new Critter();
        testCritter.setCritterId(1);
        testCritter.setOwner(testUser);
        testCritter.setCritterName("TestCritter");
        testCritter.setEvolutionStage(baseStage);
        testCritter.setHunger(5);
        testCritter.setHappiness(5);
        testCritter.setWeight(10);
        testCritter.setTraining(0);
        testCritter.setTrainingSessions(0);
        testCritter.setSnackCounter(0);
        testCritter.setMealCounter(0);
        testCritter.setHealthy(true);
        testCritter.setInjured(false);
        testCritter.setHasCalled(false);
        testCritter.setActive(false);
        testCritter.setAsleep(false);
        testCritter.setCanDefend(false);
        testCritter.setDead(false);

        testMeal = new Food();
        testMeal.setFoodName("Bread");
        testMeal.setSatiation(5);
        testMeal.setFoodType(EnumFoodType.MEAL);

        testSnack = new Food();
        testSnack.setFoodName("Cake");
        testSnack.setSatiation(3);
        testSnack.setFoodType(EnumFoodType.SNACK);
    }

    // TESTS
    @Test
    void createNewCritter_shouldUseNameFromRequestObject() {
        NewCritterRequest request = new NewCritterRequest();
        request.setCritterName("Pikachu");

        when(critterEvolutionRepository.findByStage(1.0))
                .thenReturn(Optional.of(baseStage));
        when(critterRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CritterGetResponse response = critterService.createNewCritter(request, testUser);

        ArgumentCaptor<Critter> critterCaptor = ArgumentCaptor.forClass(Critter.class);
        verify(critterRepository).save(critterCaptor.capture());

        Critter savedCritter = critterCaptor.getValue();
        assertEquals("Pikachu", savedCritter.getCritterName());
        assertEquals(testUser, savedCritter.getOwner());
        assertEquals(10, savedCritter.getHunger());
        assertEquals(10, savedCritter.getHappiness());
        assertEquals(1, savedCritter.getWeight());
        assertTrue(savedCritter.isHealthy());
        assertFalse(savedCritter.isInjured());
        assertFalse(savedCritter.isAsleep());
        assertFalse(savedCritter.isActive());
    }

    // --- Get Critter Tests ---
    @Test
    void getCritterById_shouldReturnCritterWhenOwned() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(critterMapper.mapToResponse(testCritter, testUser)).thenReturn(new CritterGetResponse());

        CritterGetResponse response = critterService.getCritterById(1, 1);

        assertNotNull(response);
        verify(critterRepository).findById(1);
    }

    @Test
    void getCritterById_shouldThrowWhenNotOwned() {
        User otherUser = new User();
        otherUser.setUserId(2);
        testCritter.setOwner(otherUser);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.getCritterById(1, 1)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("You do not own this critter", exception.getReason());
    }

    @Test
    void getAllCrittersForUser_shouldReturnOnlyOwnedCritters() {
        Critter critter2 = new Critter();
        critter2.setCritterId(2);
        critter2.setOwner(testUser);

        when(critterRepository.findByOwner_UserId(1)).thenReturn(Arrays.asList(testCritter, critter2));
        when(critterMapper.mapToResponse(any(), eq(testUser))).thenReturn(new CritterGetResponse());

        List<CritterGetResponse> responses = critterService.getAllCrittersForUser(testUser);

        assertEquals(2, responses.size());
        verify(critterRepository).findByOwner_UserId(1);
    }

    // --- Update Critter Tests ---
    @Test
    void updateCritter_shouldUpdateProvidedFields() {
        CritterUpdateRequest updateRequest = new CritterUpdateRequest();
        updateRequest.setHunger(8);
        updateRequest.setHappiness(7);
        updateRequest.setWeight(12);
        updateRequest.setEvolution(2.0);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(critterEvolutionRepository.findByStage(2.0)).thenReturn(Optional.of(adultStage));

        critterService.updateCritter(1, 1, updateRequest);

        assertEquals(8, testCritter.getHunger());
        assertEquals(7, testCritter.getHappiness());
        assertEquals(12, testCritter.getWeight());
        assertEquals(adultStage, testCritter.getEvolutionStage());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void updateCritter_shouldIgnoreNullFields() {
        CritterUpdateRequest updateRequest = new CritterUpdateRequest();
        updateRequest.setHunger(8);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.updateCritter(1, 1, updateRequest);

        assertEquals(8, testCritter.getHunger());
        assertEquals(5, testCritter.getHappiness()); // unchanged
        assertEquals(10, testCritter.getWeight()); // unchanged
        verify(critterRepository).save(testCritter);
    }

    @Test
    void updateCritter_shouldThrowForInvalidEvolutionStage() {
        CritterUpdateRequest updateRequest = new CritterUpdateRequest();
        updateRequest.setEvolution(3.0);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(critterEvolutionRepository.findByStage(3.0)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.updateCritter(1, 1, updateRequest)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Invalid evolution stage", exception.getReason());
    }

    // --- Delete Critter Tests ---
    @Test
    void deleteCritter_shouldDeleteWhenOwned() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.deleteCritter(1, 1);

        verify(critterRepository).delete(testCritter);
    }

    @Test
    void deleteCritter_shouldThrowWhenNotOwned() {
        User otherUser = new User();
        otherUser.setUserId(2);
        testCritter.setOwner(otherUser);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.deleteCritter(1, 1)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(critterRepository, never()).delete(any());
    }

    // --- Play Control Tests ---
    @Test
    void startPlaying_shouldActivateCritter() {
        testCritter.setActive(false);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.startPlaying(1, 1);

        assertTrue(testCritter.isActive());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void stopPlaying_shouldDeactivateCritter() {
        testCritter.setActive(true);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.stopPlaying(1, 1);

        assertFalse(testCritter.isActive());
        verify(critterRepository).save(testCritter);
    }

    // --- Feed Critter Tests ---
    @Test
    void feedCritter_withMeal_shouldIncreaseHungerAndMealCounter() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(foodRepository.findByFoodName("Bread")).thenReturn(testMeal);

        critterService.feedCritter(1, 1, "Bread");

        assertEquals(10, testCritter.getHunger());
        assertEquals(1, testCritter.getMealCounter());
        assertEquals(0, testCritter.getSnackCounter());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void feedCritter_withSnack_shouldIncreaseHappinessForEarlyStage() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(foodRepository.findByFoodName("Cake")).thenReturn(testSnack);

        critterService.feedCritter(1, 1, "Cake");

        assertEquals(9, testCritter.getHappiness());
        assertEquals(1, testCritter.getSnackCounter());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void feedCritter_whenFull_shouldThrowException() {
        testCritter.setHunger(10);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.feedCritter(1, 1, "Bread")
        );

        assertEquals("Critter not hungry!", exception.getReason());
        verify(critterRepository, never()).save(any());
    }

    @Test
    void feedCritter_withNonexistentFood_shouldThrowException() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));
        when(foodRepository.findByFoodName("InvalidFood")).thenReturn(null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.feedCritter(1, 1, "InvalidFood")
        );

        assertEquals("Food not found", exception.getReason());
        verify(critterRepository, never()).save(any());
    }

    // --- Train Critter Tests ---
    @Test
    void trainCritter_forBabyStage_shouldIncreaseStatsFaster() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.trainCritter(1, 1, 3);

        assertEquals(8, testCritter.getHappiness()); // 5 + 3
        assertEquals(3, testCritter.getTraining());
        assertEquals(1, testCritter.getTrainingSessions());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void trainCritter_forAdultStage_shouldIncreaseStatsSlower() {
        testCritter.setEvolutionStage(adultStage);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.trainCritter(1, 1, 3);

        assertEquals(6, testCritter.getHappiness()); // 5 + (3/2)
        assertEquals(1, testCritter.getTraining()); // 0 + (3/2)
        assertEquals(1, testCritter.getTrainingSessions());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void trainCritter_shouldReduceWeightAfterEverySecondSession() {
        // Initial state - no previous sessions
        testCritter.setTrainingSessions(0); // Starting from 0
        testCritter.setWeight(10);
        testCritter.setHappiness(5); // Set initial happiness
        testCritter.setTraining(0); // Set initial training
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        // First training session (count becomes 1)
        critterService.trainCritter(1, 1, 3);
        assertEquals(10, testCritter.getWeight()); // No reduction yet
        assertEquals(1, testCritter.getTrainingSessions());

        // Reset mock for second call
        testCritter.setTrainingSessions(1); // Set to previous end state
        testCritter.setWeight(10); // Reset weight
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        // Second training session (count becomes 2)
        critterService.trainCritter(1, 1, 3);
        assertEquals(8, testCritter.getWeight()); // Now reduced
        assertEquals(2, testCritter.getTrainingSessions());

        verify(critterRepository, times(2)).save(testCritter);
    }

    // --- Respond to Call Tests ---
    @Test
    void respondToCall_shouldResetHasCalled() {
        testCritter.setHasCalled(true);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.respondToCall(1, 1);

        assertFalse(testCritter.isHasCalled());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void respondToCall_whenNotCalled_shouldThrowException() {
        testCritter.setHasCalled(false);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.respondToCall(1, 1)
        );

        assertEquals("Critter did not call", exception.getReason());
        verify(critterRepository, never()).save(any());
    }

    // --- Heal Critter Tests ---
    @Test
    void healCritter_withBandAid_shouldHealInjury() {
        testCritter.setInjured(true);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.healCritter(1, 1, EnumMedicineType.BAND_AID.toString());

        assertFalse(testCritter.isInjured());
        verify(critterRepository).save(testCritter);
    }

    @Test
    void healCritter_withPill_shouldCureSickness() {
        testCritter.setHealthy(false);
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        critterService.healCritter(1, 1, EnumMedicineType.PILL.toString());

        assertTrue(testCritter.isHealthy());
        verify(critterRepository).save(testCritter);
    }

        @Test
    void healCritter_whenHealthyAndUninjured_shouldThrowException() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.healCritter(1, 1, EnumMedicineType.BAND_AID.toString())
        );

        assertEquals("Critter is neither sick nor injured", exception.getReason());
        verify(critterRepository, never()).save(any());
    }

    // --- Helper Method Tests ---
    @Test
    void getOwnedCritter_shouldReturnCritterWhenOwned() {
        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        Critter result = critterService.getOwnedCritter(1, 1);

        assertEquals(testCritter, result);
    }

    @Test
    void getOwnedCritter_shouldThrowWhenNotOwned() {
        User otherUser = new User();
        otherUser.setUserId(2);
        testCritter.setOwner(otherUser);

        when(critterRepository.findById(1)).thenReturn(Optional.of(testCritter));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.getOwnedCritter(1, 1)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("You do not own this critter", exception.getReason());
    }

    @Test
    void getOwnedCritter_shouldThrowWhenNotFound() {
        when(critterRepository.findById(1)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> critterService.getOwnedCritter(1, 1)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Critter not found", exception.getReason());
    }
}