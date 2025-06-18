package com.CuteComputerCritters.backend.api.Websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Enable simple broker for topic-based messaging
        config.enableSimpleBroker("/topic");
        // Application destination prefix for messages from client to server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint clients will connect to
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // for development, tighten in production
                .withSockJS(); // fallback for browsers without WS support
    }
}
