package com.CuteComputerCritters.backend.api.helpers;

import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class CritterBroadcaster {
    private final SimpMessagingTemplate messagingTemplate;

    public CritterBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcast(CritterGetResponse critterGetResponse) {
        // Example topic with critter ID included
        String destination = "/topic/critter/" + critterGetResponse.getCritterId();
        messagingTemplate.convertAndSend(destination, critterGetResponse);
    }
}
