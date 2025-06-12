package com.CuteComputerCritters.backend.api.model.User;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity(name ="REFRESHTOKEN")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @OneToOne
    @JoinColumn(name = "APP_USER", referencedColumnName = "USER_ID")
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

}
