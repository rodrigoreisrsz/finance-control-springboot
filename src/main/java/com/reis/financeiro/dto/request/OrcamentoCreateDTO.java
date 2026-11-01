package com.reis.financeiro.dto.request;

import com.reis.financeiro.entities.CategoriaRegistro;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class OrcamentoCreateDTO {
    @NotNull
    private CategoriaRegistro categoria;

    @NotNull
    @Positive
    private BigDecimal valor;

    @NotBlank
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$")
    private String mes;

    public CategoriaRegistro getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaRegistro categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getMes() {
        return mes;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }
}
