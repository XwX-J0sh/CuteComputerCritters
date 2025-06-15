package com.CuteComputerCritters.backend.api.security.jwt;

import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${cutecritter.app.jwtSecret}")
    private String jwtSecret;

    @Value("${cutecritter.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${cutecritter.app.jwtCookieName}")
    private String jwtCookie;

    @Value("${cutecritter.app.jwtRefreshCookieName}")
    private String jwtRefreshCookie;

    @Value("${cutecritter.app.jwtRefreshExpirationMS}")
    private long jwtRefreshExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        return generateCookie(jwtCookie, jwt, "/", jwtExpirationMs / 1000L);
    }

    public ResponseCookie generateJwtCookie(User user) {
        String jwt = generateTokenFromUsername(user.getUsername());
        return generateCookie(jwtCookie, jwt, "/", jwtExpirationMs / 1000L);
    }

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        return generateCookie(jwtRefreshCookie, refreshToken, "/", jwtRefreshExpirationMs / 1000L);
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtCookie);
    }

    public String getJwtRefreshFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtRefreshCookie);
    }

    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookie, null)
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                //.secure(true) enable in PROD
                //.sameSite("None") enable in PROD
                .build();
    }

    public ResponseCookie getCleanJwtRefreshCookie() {
        return ResponseCookie.from(jwtRefreshCookie, null)
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                //.secure(true) enable in PROD
                //.sameSite("None") enable in PROD
                .build();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    private ResponseCookie generateCookie(String name, String value, String path, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .path(path)
                .maxAge(maxAgeSeconds)
                .httpOnly(true)
                //.secure(true) enable in PROD
                //.sameSite("None") enable in PROD
                .build();
    }

    private String getCookieValueByName(HttpServletRequest request, String name) {
        Cookie cookie = WebUtils.getCookie(request, name);
        return cookie != null ? cookie.getValue() : null;
    }
}
