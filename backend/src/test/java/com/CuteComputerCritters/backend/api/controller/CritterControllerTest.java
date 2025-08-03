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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

class CritterControllerTest {

    @Mock
    private CritterService critterService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CritterBroadcaster critterBroadcaster;

    @Mock
    private CritterMapper critterMapper;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private CritterController critterController;

    private User testUser;
    private UserDetailsImpl userDetails;
    private CritterGetResponse testResponse;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setUserId(1);

        userDetails = new UserDetailsImpl(1, "testuser", "test@example.com", "password", Collections.emptyList());

        testResponse = new CritterGetResponse();

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findById(anyInt())).thenReturn(java.util.Optional.of(testUser));
        when(critterMapper.mapToResponse(any(), any())).thenReturn(testResponse);
    }

    @Test
    void createNewCritter_Success() {
        NewCritterRequest request = new NewCritterRequest();
        when(critterService.createNewCritter(any(), any())).thenReturn(testResponse);

        ResponseEntity<?> response = critterController.createNewCritter(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testResponse, response.getBody());
        verify(critterBroadcaster).broadcast(testResponse);
    }

    @Test
    void createNewCritter_Unauthorized() {
        when(authentication.getPrincipal()).thenReturn(null);

        assertThrows(ResponseStatusException.class, () -> {
            critterController.createNewCritter(authentication, new NewCritterRequest());
        });
    }

    @Test
    void updateCritter_Success() {
        CritterUpdateRequest request = new CritterUpdateRequest();
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.updateCritter(authentication, 1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testResponse, response.getBody());
        verify(critterService).updateCritter(1, 1, request);
    }

    @Test
    void getCritterById_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.getCritterById(authentication, 1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testResponse, response.getBody());
    }

    @Test
    void getAllCritters_Success() {
        List<CritterGetResponse> expected = Collections.singletonList(testResponse);
        when(critterService.getAllCrittersForUser(any())).thenReturn(expected);

        ResponseEntity<?> response = critterController.getAllCritters(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteCritter_Success() {
        ResponseEntity<?> response = critterController.deleteCritter(1, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Critter deleted successfully", response.getBody());
        verify(critterService).deleteCritter(1, 1);
    }

    @Test
    void startPlaying_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.startPlaying(1, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).startPlaying(1, 1);
    }

    @Test
    void stopPlaying_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.stopPlaying(1, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).stopPlaying(1, 1);
    }

    @Test
    void feedCritter_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.feedCritter(authentication, 1, "Cake");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).feedCritter(1, 1, "Cake");
    }

    @Test
    void trainCritter_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.trainCritter(authentication, 1, 5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).trainCritter(1, 1, 5);
    }

    @Test
    void respondToCall_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.respondToCall(1, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).respondToCall(1, 1);
    }

    @Test
    void heal_Success() {
        when(critterService.getOwnedCritter(anyInt(), anyInt())).thenReturn(null);

        ResponseEntity<?> response = critterController.heal(1, authentication, "bandaid");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(critterService).healCritter(1, 1, "bandaid");
    }

    @Test
    void authenticateAndGetUser_UserNotFound() {
        when(userRepository.findById(anyInt())).thenReturn(java.util.Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            critterController.authenticateAndGetUser(authentication);
        });
    }
}
