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

    public SecurityFilter(TokenService tokenService, UserDetailsService userDetailsService) {
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        System.out.println(">>> SECURITY FILTER EXECUTADO <<<");
        System.out.println("Método: " + request.getMethod());
        System.out.println("URI: " + request.getRequestURI());
        String authorizationHeader = request.getHeader("Authorization");
        if(authorizationHeader == null){
            System.out.println("Cabeçalho de Autorização nulo.");

        }
        else if(authorizationHeader.toLowerCase().startsWith("bearer ")){
            String token = authorizationHeader.substring(7).trim();
            System.out.println("Token encontrado.");
            String subject = tokenService.getSubject(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(subject);
            UsernamePasswordAuthenticationToken authentication =new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println(
                    "Autenticação criada: " +
                            SecurityContextHolder.getContext()
                                    .getAuthentication().isAuthenticated()
            );
            System.out.println(
                    "Autenticado: " +
                            SecurityContextHolder.getContext()
                                    .getAuthentication().isAuthenticated()
            );
        }else{
            System.out.println("Cabeçalho authorization ausente ou inválido.");

        }
        filterChain.doFilter(request, response);
    }

}
