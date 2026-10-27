package com.reis.financeiro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    private final List<String> allowedOrigins;

    public CorsConfig(
            @Value("${app.cors.allowed-origins}") String configuredOrigins,
            @Value("${app.cors.require-https-origin:false}") boolean requireHttpsOrigin) {
        if (configuredOrigins == null || configuredOrigins.isBlank()) {
            throw new IllegalStateException("Configure ao menos uma origem CORS autorizada.");
        }

        this.allowedOrigins = Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .peek(origin -> validarOrigem(origin, requireHttpsOrigin))
                .toList();

        if (this.allowedOrigins.isEmpty()) {
            throw new IllegalStateException("Configure ao menos uma origem CORS autorizada.");
        }
    }

    private static void validarOrigem(String origin, boolean requireHttpsOrigin) {
        try {
            URI uri = URI.create(origin);
            boolean origemValida = uri.getHost() != null
                    && ("http".equalsIgnoreCase(uri.getScheme())
                    || "https".equalsIgnoreCase(uri.getScheme()))
                    && uri.getUserInfo() == null
                    && (uri.getPath() == null || uri.getPath().isEmpty())
                    && uri.getQuery() == null
                    && uri.getFragment() == null;

            if (!origemValida || "*".equals(origin)
                    || (requireHttpsOrigin && !"https".equalsIgnoreCase(uri.getScheme()))) {
                throw new IllegalArgumentException("A origem CORS configurada não é permitida.");
            }
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("A origem CORS configurada não é válida.", exception);
        }
    }

}