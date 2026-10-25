package com.reis.financeiro;

import com.reis.financeiro.config.CorsConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CorsConfigTest {

    @Test
    void exigeAoMenosUmaOrigemConfigurada() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new CorsConfig("", false));

        assertTrue(exception.getMessage().contains("origem CORS"));
    }

    @Test
    void rejeitaWildcardComoOrigem() {
        assertThrows(IllegalStateException.class, () -> new CorsConfig("*", false));
    }

    @Test
    void perfilDeProducaoExigeOrigemHttps() {
        assertThrows(
                IllegalStateException.class,
                () -> new CorsConfig("http://frontend.example", true));
        new CorsConfig("https://frontend.example", true);
    }
}
