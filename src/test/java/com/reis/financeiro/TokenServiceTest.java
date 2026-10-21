package com.reis.financeiro;

import com.reis.financeiro.entities.User;
import com.reis.financeiro.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TokenServiceTest {

    private static final String SEGREDO =
            "segredo-jwt-de-teste-com-mais-de-32-bytes";

    private final TokenService tokenService = new TokenService();

    @BeforeEach
    void configurarTokenService() {
        ReflectionTestUtils.setField(tokenService, "secret", SEGREDO);
        ReflectionTestUtils.setField(tokenService, "expiration", 60_000L);
    }

    @Test
    void deveRecuperarEmailDeTokenAssinado() {
        User user = new User(
                42L,
                "Usuário Teste",
                "teste@email.com",
                "senha-hash"
        );

        String token = tokenService.generateToken(user);

        assertEquals("teste@email.com", tokenService.getSubject(token));
    }

    @Test
    void deveRejeitarTokenComAssinaturaAlterada() {
        User user = new User(
                42L,
                "Usuário Teste",
                "teste@email.com",
                "senha-hash"
        );
        String[] partes = tokenService.generateToken(user).split("\\.");
        String assinaturaAlterada =
                (partes[2].startsWith("A") ? "B" : "A")
                        + partes[2].substring(1);
        String tokenAlterado =
                partes[0] + "." + partes[1] + "." + assinaturaAlterada;

        assertThrows(
                IllegalArgumentException.class,
                () -> tokenService.getSubject(tokenAlterado)
        );
    }

    @Test
    void deveRejeitarTokenExpirado() {
        ReflectionTestUtils.setField(tokenService, "expiration", -1_000L);
        User user = new User(
                42L,
                "Usuário Teste",
                "teste@email.com",
                "senha-hash"
        );

        String tokenExpirado = tokenService.generateToken(user);

        assertThrows(
                IllegalArgumentException.class,
                () -> tokenService.getSubject(tokenExpirado)
        );
    }
}
