package com.reis.financeiro;

import com.reis.financeiro.config.CorsConfig;
import com.reis.financeiro.config.SecurityConfig;
import com.reis.financeiro.config.SecurityFilter;
import com.reis.financeiro.controllers.UserController;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.TokenService;
import com.reis.financeiro.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@Import({SecurityConfig.class, SecurityFilter.class, CorsConfig.class})
@TestPropertySource(properties = "app.cors.allowed-origins=http://localhost:5173")
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @BeforeEach
    void configurarUsuarioAutenticado() {
        User usuario = new User(42L, "Usuário Teste", "teste@email.com", "senha-hash");
        UserJWT usuarioJWT = new UserJWT(usuario);

        when(tokenService.getSubject("token-valido")).thenReturn("teste@email.com");
        when(userDetailsService.loadUserByUsername("teste@email.com")).thenReturn(usuarioJWT);
    }

    @Test
    void deveBloquearPerfilSemToken() throws Exception {
        mockMvc.perform(get("/user/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornarSomentePerfilDoUsuarioAutenticado() throws Exception {
        mockMvc.perform(get("/user/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-valido"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Usuário Teste"))
                .andExpect(jsonPath("$.email").value("teste@email.com"))
                .andExpect(jsonPath("$.jwt").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void devePermitirOrigemConfiguradaEManterProtecaoDoEndpoint() throws Exception {
        mockMvc.perform(get("/user/me")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    void deveRejeitarOrigemNaoConfigurada() throws Exception {
        mockMvc.perform(get("/user/me")
                        .header(HttpHeaders.ORIGIN, "https://attacker.example"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    void deveAtenderPreflightComAuthorization() throws Exception {
        mockMvc.perform(options("/user/me")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "authorization"));
    }

    @Test
    void devePermitirRequisicaoJwtDeOrigemConfigurada() throws Exception {
        mockMvc.perform(get("/user/me")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-valido"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }
}
