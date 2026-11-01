package com.reis.financeiro.controllers;

import com.reis.financeiro.dto.request.RecorrenciaCreateDTO;
import com.reis.financeiro.dto.request.RecorrenciaStatusDTO;
import com.reis.financeiro.dto.response.RecorrenciaResponse;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.RecorrenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recorrencias")
public class RecorrenciaController {
    private final RecorrenciaService service;

    public RecorrenciaController(RecorrenciaService service) {
        this.service = service;
    }

    @GetMapping
    public List<RecorrenciaResponse> listar(@AuthenticationPrincipal UserJWT usuario) {
        return service.listar(usuario.getUser().getUserId());
    }

    @PostMapping
    public ResponseEntity<RecorrenciaResponse> criar(
            @RequestBody @Valid RecorrenciaCreateDTO dados,
            @AuthenticationPrincipal UserJWT usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criar(usuario.getUser().getUserId(), dados));
    }

    @PatchMapping("/{id}/status")
    public RecorrenciaResponse alterarStatus(
            @PathVariable Long id,
            @RequestBody @Valid RecorrenciaStatusDTO dados,
            @AuthenticationPrincipal UserJWT usuario) {
        return service.alterarStatus(id, usuario.getUser().getUserId(), dados.getAtiva());
    }

    @PostMapping("/{id}/executar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void executarProxima(@PathVariable Long id, @AuthenticationPrincipal UserJWT usuario) {
        service.executarProxima(id, usuario.getUser().getUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @AuthenticationPrincipal UserJWT usuario) {
        service.excluir(id, usuario.getUser().getUserId());
    }
}
