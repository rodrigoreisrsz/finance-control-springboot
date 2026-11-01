package com.reis.financeiro.controllers;

import com.reis.financeiro.dto.request.OrcamentoCreateDTO;
import com.reis.financeiro.dto.response.OrcamentoResponse;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.OrcamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/orcamentos")
public class OrcamentoController {
    private final OrcamentoService service;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<OrcamentoResponse> listar(
            @RequestParam String mes,
            @AuthenticationPrincipal UserJWT usuario) {
        try {
            return service.listar(usuario.getUser().getUserId(), YearMonth.parse(mes));
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o mês no formato AAAA-MM.", exception);
        }
    }

    @PostMapping
    public ResponseEntity<OrcamentoResponse> salvar(
            @RequestBody @Valid OrcamentoCreateDTO dados,
            @AuthenticationPrincipal UserJWT usuario) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(service.salvar(usuario.getUser().getUserId(), dados));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @AuthenticationPrincipal UserJWT usuario) {
        service.excluir(id, usuario.getUser().getUserId());
    }
}
