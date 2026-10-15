package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.User;
import com.reis.financeiro.service.TokenService;


public class UserResponse {

    private Long id;
    private String name;
    private String jwt;




    public UserResponse(User user, String jwt) {
        this.name = user.getName();
        this.id = user.getId();
        this.jwt = jwt;
    }
    public UserResponse(User user) {
        this.name = user.getName();
        this.id = user.getId();
    }
    public UserResponse() {

    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getJwt() {
        return jwt;
    }
}
