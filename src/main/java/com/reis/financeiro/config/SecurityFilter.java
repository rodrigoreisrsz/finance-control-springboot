
package com.reis.financeiro.config;

import com.reis.financeiro.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserDetailsService userDetailsService;

    public SecurityFilter(
            TokenService tokenService,
            UserDetailsService userDetailsService
    ) {
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.regionMatches(
                true, 0, "Bearer ", 0, 7)) {

            String token = authorizationHeader
                    .substring(7)
                    .trim();

            if (token.isEmpty()) {
                responderNaoAutorizado(response);
                return;
            }

            try {
                String subject = tokenService.getSubject(token);

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(subject);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (RuntimeException e) {
                SecurityContextHolder.clearContext();
                responderNaoAutorizado(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void responderNaoAutorizado(
            HttpServletResponse response
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"erro\":\"Token inválido ou expirado.\"}"
        );
    }
}
