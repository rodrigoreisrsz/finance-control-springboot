
package com.reis.financeiro.service;

import com.reis.financeiro.entities.User;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration}")
    private Long expiration;

    @PostConstruct
    void validarConfiguracao() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET deve conter pelo menos 32 bytes."
            );
        }
        if (expiration == null || expiration <= 0) {
            throw new IllegalStateException(
                    "A duração do token JWT deve ser positiva."
            );
        }
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "A chave JWT HS256 deve ter pelo menos 32 bytes."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .setIssuer("Finanças")
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + expiration)
                )
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String getSubject(String tokenJWT) {
        try {
            String subject = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .sig()
                    .clear()
                    .add(Jwts.SIG.HS256)
                    .and()
                    .build()
                    .parseSignedClaims(tokenJWT)
                    .getPayload()
                    .getSubject();

            if (subject == null || subject.isBlank()) {
                throw new IllegalArgumentException(
                        "O token não possui um assunto válido."
                );
            }

            return subject;

        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Token JWT inválido ou expirado.", e
            );
        }
    }
}
