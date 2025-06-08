package com.CuteComputerCritters.backend.api.repository;

import com.CuteComputerCritters.backend.api.model.User.EnumRole;
import com.CuteComputerCritters.backend.api.model.User.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(EnumRole name);

    boolean existsByName(EnumRole enumRole);
}
