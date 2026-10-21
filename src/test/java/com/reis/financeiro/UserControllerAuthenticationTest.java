package com.reis.financeiro;

import com.reis.financeiro.config.SecurityConfig;
import com.reis.financeiro.config.SecurityFilter;
import com.reis.financeiro.controllers.UserController;
import com.reis.financeiro.exceptions.GlobalExceptionHandler;
import com.reis.financeiro.service.TokenService;
import com.reis.financeiro.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@Import({SecurityConfig.class, SecurityFilter.class, GlobalExceptionHandler.class})
class UserControllerAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void deveResponder401ComCredenciaisInvalidas() throws Exception {
        when(userService.login("teste@email.com", "senha-incorreta"))
                .thenThrow(new BadCredentialsException("Senha incorreta."));

        mockMvc.perform(
                        post("/user/login")
                                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                                .content("""
                                        {
                                          "email": "teste@email.com",
                                          "password": "senha-incorreta"
                                        }
                                        """)
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value(
                        "Credenciais inválidas."
                ));

        verify(userService).login("teste@email.com", "senha-incorreta");
    }
}
