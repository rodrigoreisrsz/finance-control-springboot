package com.reis.financeiro.controllers;

import com.reis.financeiro.dto.request.AporteCreateDTO;
import com.reis.financeiro.dto.request.CofreCreateDTO;
import com.reis.financeiro.dto.response.CofreResponse;

import com.reis.financeiro.entities.Aporte;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.CofreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/cofre")
public class CofreController {
    private final CofreService service;

    @Autowired
    public CofreController(CofreService service) {
        this.service = service;
    }
    @GetMapping
    public List<CofreResponse> listarMetas(@AuthenticationPrincipal UserJWT userAutheticated){
        return service.listarMetas(userAutheticated.getUser().getUserId() );
    }
    @GetMapping("/{id}")

    public ResponseEntity<CofreResponse> buscarPorId(@PathVariable Long id, @AuthenticationPrincipal UserJWT userAutheticated){
        CofreResponse response = service.buscarPorId(id, userAutheticated.getUser().getUserId() );
        return ResponseEntity.ok(response);
    }


    @PostMapping
    public ResponseEntity<CofreResponse> criar (@RequestBody @Valid CofreCreateDTO cofreCreateDTO, @AuthenticationPrincipal UserJWT userAutheticated){
        CofreResponse response = service.criarCofre(userAutheticated.getUser().getUserId() , cofreCreateDTO.getNome(), cofreCreateDTO.getMeta(), cofreCreateDTO.getDeposito());
        return ResponseEntity.ok(response);

    }

    @PutMapping("/{id}")
    public ResponseEntity<CofreResponse> editar(@PathVariable long id,
                                                @RequestBody CofreCreateDTO cofreCreateDTO,
                                                @AuthenticationPrincipal UserJWT userAutheticated){
        CofreResponse response = service.editar(id, userAutheticated.getUser().getUserId() ,
                cofreCreateDTO.getNome(),
                cofreCreateDTO.getMeta());
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable long id, @AuthenticationPrincipal UserJWT userAutheticated){
        service.deletar(id, userAutheticated.getUser().getUserId());
    }
//    @GetMapping
//    public List<Aporte> findAportes(@AuthenticationPrincipal UserJWT userAuthenticated){
//        service.
//    }
    @PostMapping("/aportes")
    public ResponseEntity<CofreResponse> criarAporte(@RequestBody @Valid AporteCreateDTO aporteCreateDTO,  @AuthenticationPrincipal UserJWT userAutheticated){
        CofreResponse response =  service.criarAporte(aporteCreateDTO.getCofreId(), userAutheticated.getUser().getUserId(), aporteCreateDTO.getValor(), aporteCreateDTO.getData());
        return  ResponseEntity.ok(response);
    }
    @DeleteMapping("/aportes{id}")
    public void deletarAporte(@PathVariable long id, @AuthenticationPrincipal UserJWT userAutheticated){
        service.deletarAporte(id, userAutheticated.getUser().getUserId());
    }


}
