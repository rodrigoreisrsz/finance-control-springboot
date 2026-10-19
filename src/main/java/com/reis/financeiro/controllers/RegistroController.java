package com.reis.financeiro.controllers;


import com.reis.financeiro.dto.request.RegistroCreateDTO;
import com.reis.financeiro.dto.response.RegistroResponse;
import com.reis.financeiro.entities.Registro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.security.UserJWT;
import com.reis.financeiro.service.RegistroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registros")
public class RegistroController {
    private final RegistroService service;

    @Autowired
    public RegistroController(RegistroService service) {
        this.service = service;
    }
    @GetMapping
    public List<RegistroResponse>listar(@AuthenticationPrincipal UserJWT userAutheticated){



        return service.listarRegistros(userAutheticated.getUser().getUserId() );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroResponse> buscaPorId(@PathVariable  long id, @AuthenticationPrincipal UserJWT userAutheticated){
        RegistroResponse response = service.buscarPorId(id, userAutheticated.getUser().getUserId() );
        return ResponseEntity.ok(response);
    }
    @PostMapping
    //@ResponseStatus(HttpStatus.CREATED) tbm retona 201 CREATED
    public ResponseEntity<RegistroResponse> criar(@RequestBody @Valid RegistroCreateDTO registroCreate, @AuthenticationPrincipal UserJWT userAutheticated ){
        RegistroResponse response = service.adicionarRegistro(userAutheticated.getUser().getUserId() , registroCreate.getNome(),
                registroCreate.getValor(), registroCreate.getDescricao(), registroCreate.getData(),
                registroCreate.getTipoRegistro());

        return  ResponseEntity.status(HttpStatus.CREATED).body(response); // retorna 201 - CREATED
    }
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id, @AuthenticationPrincipal UserJWT userAutheticated){
        service.deletarRegistro(id, userAutheticated.getUser().getUserId() );
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroResponse> editar(@PathVariable long id,
                                                   @RequestBody @Valid RegistroCreateDTO registroCreateDTO,
                                                   @AuthenticationPrincipal UserJWT userAutheticated
    ){
        RegistroResponse response =  service.editar(id, userAutheticated.getUser().getUserId() , registroCreateDTO.getNome(),
                registroCreateDTO.getValor(), registroCreateDTO.getDescricao(), registroCreateDTO.getData(),
                registroCreateDTO.getTipoRegistro());
        return  ResponseEntity.ok(response);
    }
}
