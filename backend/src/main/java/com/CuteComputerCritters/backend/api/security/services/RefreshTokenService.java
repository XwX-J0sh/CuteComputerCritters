package com.CuteComputerCritters.backend.api.security.services;

import com.CuteComputerCritters.backend.api.model.User.RefreshToken;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.repository.RefreshTokenRepository;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import com.CuteComputerCritters.backend.api.security.jwt.JwtUtils;
import com.CuteComputerCritters.backend.api.security.jwt.exception.TokenRefreshException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${cutecritter.app.jwtRefreshExpirationMS}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(int userId) {
        // Retrieve the user entity by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Find existing refresh token for this user and delete if present
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUser(user);
        existingToken.ifPresent(refreshTokenRepository::delete);

        // Create new refresh token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());  // generate random token string
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs)); // set expiration explicitly

        // Save and return the new token
        return refreshTokenRepository.save(refreshToken);
    }


    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
        }

        return token;
    }

    @Transactional
    public int deleteByUserId(int userId) {
        return refreshTokenRepository.deleteByUser_UserId(userId);
    }
}
