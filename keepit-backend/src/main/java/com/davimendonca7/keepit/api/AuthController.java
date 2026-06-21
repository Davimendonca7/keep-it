package com.davimendonca7.keepit.api;

import com.davimendonca7.keepit.domain.user.UserService;
import com.davimendonca7.keepit.domain.user.dto.AuthLoginDto;
import com.davimendonca7.keepit.domain.user.dto.AuthRegisterDto;
import com.davimendonca7.keepit.infra.security.token.dto.JwtTokenService;
import com.davimendonca7.keepit.infra.security.token.dto.RecoveryJwtTokenDto;
import com.davimendonca7.keepit.infra.security.user.UserDetailsImplService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenService jwtTokenService;
    private final UserDetailsImplService userDetailsImplService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid AuthRegisterDto dto) {
        userService.createUser(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<RecoveryJwtTokenDto> login(@RequestBody @Valid AuthLoginDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenService.generateToken(userDetails);
        return ResponseEntity.ok(new RecoveryJwtTokenDto(token));
    }
}
