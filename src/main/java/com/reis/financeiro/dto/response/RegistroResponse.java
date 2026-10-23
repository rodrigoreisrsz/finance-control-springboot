package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.Registro;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class RegistroResponse {
    private Long id;
    private String nome;
    private BigDecimal valor;
    private LocalDate data;
    private String descricao;
    private String tipoRegistro;

    public RegistroResponse(Registro registroSalvo) {
        this.id = registroSalvo.getId();
        this.nome = registroSalvo.getNome();
        this.valor = registroSalvo.getValor();
        this.data = registroSalvo.getData();
        this.descricao = registroSalvo.getDescricao();
        this.tipoRegistro = registroSalvo.getTipoRegistro().name();
    }


}
