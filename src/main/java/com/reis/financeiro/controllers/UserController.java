package com.reis.financeiro.controllers;

import com.reis.financeiro.dto.request.LoginDTO;
import com.reis.financeiro.dto.request.UserCreateDTO;
import com.reis.financeiro.dto.response.UserResponse;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @Autowired

    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping
    public ResponseEntity<UserResponse> cadastrar(@RequestBody @Valid UserCreateDTO userCreate){

        UserResponse response = userService.cadastrar(userCreate);
        return ResponseEntity.ok(response);

    }
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody  LoginDTO loginDTO){
        UserResponse response = userService.login(loginDTO.getEmail(), loginDTO.getPassword());
        return ResponseEntity.ok(response);
    }
}
