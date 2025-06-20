package com.CuteComputerCritters.backend.api.service;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

}
