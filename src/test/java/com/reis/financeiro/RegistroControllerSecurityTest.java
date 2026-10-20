package com.reis.financeiro;

// Classes do projeto
import com.reis.financeiro.config.SecurityConfig;
import com.reis.financeiro.config.SecurityFilter;
import com.reis.financeiro.controllers.RegistroController;
import com.reis.financeiro.dto.response.RegistroResponse;
import com.reis.financeiro.entities.Registro;
import com.reis.financeiro.entities.TipoRegistro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.RegistroService;
import com.reis.financeiro.service.TokenService;

// JUnit: estrutura dos testes
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// Spring: configuração do teste web
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;

// Spring Security
import org.springframework.security.core.userdetails.UserDetailsService;

// Mockito integrado ao Spring
import org.springframework.test.context.bean.override.mockito.MockitoBean;

// MockMvc: simula requisições HTTP
import org.springframework.test.web.servlet.MockMvc;

// Classes Java
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = RegistroController.class)
@Import({SecurityConfig.class, SecurityFilter.class})
class RegistroControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistroService registroService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User usuario;
    private UserJWT usuarioJWT;

    @BeforeEach
    void configurarUsuarioAutenticado() {
        usuario = new User(
                42L,
                "Usuário Teste",
                "teste@email.com",
                "senha-hash"
        );

        usuarioJWT = new UserJWT(usuario);

        when(tokenService.getSubject("token-valido"))
                .thenReturn("teste@email.com");

        when(userDetailsService.loadUserByUsername("teste@email.com"))
                .thenReturn(usuarioJWT);
    }

    @Test
    void deveBloquearListagemSemToken() throws Exception {
        mockMvc.perform(get("/registros"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(registroService);
    }

    @Test
    void devePermitirListagemComTokenValido() throws Exception {
        when(registroService.listarRegistros(42L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/registros")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer token-valido"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(registroService).listarRegistros(42L);
    }

    @Test
    void deveUsarIdDoUsuarioAutenticadoNaBuscaPorId()
            throws Exception {

        Registro registro = new Registro(
                usuario,
                "Conta de luz",
                new BigDecimal("150.00"),
                "Conta mensal",
                LocalDate.of(2026, 10, 1),
                TipoRegistro.GASTO
        );

        registro.setId(7L);

        when(registroService.buscarPorId(7L, 42L))
                .thenReturn(new RegistroResponse(registro));

        mockMvc.perform(
                        get("/registros/7")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer token-valido"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.nome").value("Conta de luz"));

        verify(registroService).buscarPorId(7L, 42L);
    }
}