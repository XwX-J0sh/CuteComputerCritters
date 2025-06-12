package com.CuteComputerCritters.backend.api.model.User;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "ROLES")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EnumRole name;

    public Role(EnumRole name) {
        this.name = name;
    }

    public Role() {
    }
}
