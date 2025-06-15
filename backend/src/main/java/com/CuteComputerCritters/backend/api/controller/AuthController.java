package com.CuteComputerCritters.backend.api.controller;

import com.CuteComputerCritters.backend.api.model.User.EnumRole;
import com.CuteComputerCritters.backend.api.model.User.RefreshToken;
import com.CuteComputerCritters.backend.api.model.User.Role;
import com.CuteComputerCritters.backend.api.model.User.User;
import com.CuteComputerCritters.backend.api.payload.request.LoginRequest;
import com.CuteComputerCritters.backend.api.payload.request.SignupRequest;
import com.CuteComputerCritters.backend.api.payload.response.MessageResponse;
import com.CuteComputerCritters.backend.api.repository.RoleRepository;
import com.CuteComputerCritters.backend.api.repository.UserRepository;
import com.CuteComputerCritters.backend.api.security.jwt.JwtResponse;
import com.CuteComputerCritters.backend.api.security.jwt.JwtUtils;
import com.CuteComputerCritters.backend.api.security.jwt.exception.TokenRefreshException;
import com.CuteComputerCritters.backend.api.security.services.RefreshTokenService;
import com.CuteComputerCritters.backend.api.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
//Maps all Requests in here to /api/auth...
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    //Maps the POST request to Endppoint /signin
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        //authenticate the loginRequest using the username and password that were passed with the Request
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        //sets the Security Context to authenticated if authentication worked (-> user is considered logged in so to speak)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        //get the User details
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        //generate access cookie (using the User details)
        ResponseCookie jwtAccessCookie = jwtUtils.generateJwtCookie(userDetails);

        // Generate refresh token cookie
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        ResponseCookie refreshTokenCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

        //store the roles of the User (ADMIN/USER)
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // sets the cookies and returns a response body holding the basic user info (status: 200)
        return ResponseEntity.ok()
                .headers(headers -> {
                    headers.add(HttpHeaders.SET_COOKIE, jwtAccessCookie.toString());
                    headers.add(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
                })
                .body(new JwtResponse(
                        userDetails.getId(),
                        userDetails.getUsername(),
                        userDetails.getEmail(),
                        roles));
    }


    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(EnumRole.USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(EnumRole.ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);

                        break;
                    default:
                        Role userRole = roleRepository.findByName(EnumRole.USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        userRepository.flush();

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        String refreshToken = jwtUtils.getJwtRefreshFromCookies(request);
        System.out.println("Logging out... Refresh token from cookie: " + refreshToken);

        if (refreshToken != null && !refreshToken.isEmpty()) {
            refreshTokenService.findByToken(refreshToken).ifPresentOrElse(token -> {
                refreshTokenService.deleteByUserId(token.getUser().getUserId());
                System.out.println("Deleted refresh token for userId: " + token.getUser().getUserId());
            }, () -> System.out.println("Refresh token not found in DB. Attempting fallback cleanup..."));
        } else {
            // Fallback: clean up any old token manually if user is authenticated
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
                refreshTokenService.deleteByUserId(userDetails.getId());
                System.out.println("Fallback cleanup: deleted token for authenticated userId " + userDetails.getId());
            } else {
                System.out.println("No refresh token and user not authenticated. No action taken.");
            }
        }

        ResponseCookie jwtCookie = jwtUtils.getCleanJwtCookie();
        ResponseCookie jwtRefreshCookie = jwtUtils.getCleanJwtRefreshCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
        String refreshToken = jwtUtils.getJwtRefreshFromCookies(request);

        if (refreshToken != null && !refreshToken.isEmpty()) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {

                        // Generate new access token cookie
                        ResponseCookie newAccessTokenCookie = jwtUtils.generateJwtCookie(user);

                        // Build roles if you want to keep returning user info, or simplify response
                        List<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList());

                        return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString())
                                .body(new JwtResponse(user.getUserId(), user.getUsername(), user.getEmail(), roles)); // Access token null or omitted
                    })
                    .orElseThrow(() -> new TokenRefreshException(refreshToken, "Refresh token is not in database!"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Refresh Token is empty!"));
    }
}
