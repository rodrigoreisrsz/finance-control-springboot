package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.Orcamento;

import java.math.BigDecimal;

public class OrcamentoResponse {
    private final Long id;
    private final String categoria;
    private final BigDecimal valor;
    private final String mes;

    public OrcamentoResponse(Orcamento orcamento) {
        this.id = orcamento.getId();
        this.categoria = orcamento.getCategoria().name();
        this.valor = orcamento.getValor();
        this.mes = orcamento.getMes().toString().substring(0, 7);
    }

    public Long getId() {
        return id;
    }

    public String getCategoria() {
        return categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getMes() {
        return mes;
    }
}
