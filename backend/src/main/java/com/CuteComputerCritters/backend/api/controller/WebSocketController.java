package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.payload.response.critter.CritterGetResponse;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/critter/stats")
    public void receiveCritterStats(CritterGetResponse critterGetResponse) {

        messagingTemplate.convertAndSend("/topic/critter/" + critterGetResponse.getCritterId(), critterGetResponse);
    }
}
