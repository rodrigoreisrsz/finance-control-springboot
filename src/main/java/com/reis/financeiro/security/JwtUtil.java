package com.reis.financeiro.security;

import lombok.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    //@Value("${jwt.secret}")
    private String secret;
}
