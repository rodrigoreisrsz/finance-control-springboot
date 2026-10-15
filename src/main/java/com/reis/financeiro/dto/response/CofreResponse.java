package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.Cofre;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class CofreResponse {
    private long id;
    private String nome;
    private BigDecimal meta;
    private BigDecimal valorAtual;

    public CofreResponse(Cofre cofre, BigDecimal valorAtual) {
        this.id = cofre.getId();
        this.nome = cofre.getNome();
        this.meta = cofre.getMeta();
        this.valorAtual = valorAtual;
    }
    public CofreResponse(Cofre cofre){
        this.id = cofre.getId();
        this.nome = cofre.getNome();
        this.meta = cofre.getMeta();

    }
}
