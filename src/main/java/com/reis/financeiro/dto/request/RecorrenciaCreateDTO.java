package com.reis.financeiro.dto.request;

import com.reis.financeiro.entities.CategoriaRegistro;
import com.reis.financeiro.entities.TipoRegistro;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.FutureOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecorrenciaCreateDTO {
    @NotBlank
    @Size(max = 100)
    private String nome;

    @NotNull
    @Positive
    private BigDecimal valor;

    @Size(max = 300)
    private String descricao;

    @NotNull
    private TipoRegistro tipoRegistro;

    @NotNull
    private CategoriaRegistro categoria;

    @Min(1)
    @Max(31)
    private int diaDoMes;

    @NotNull
    @FutureOrPresent
    private LocalDate dataInicio;

    private boolean confirmacaoObrigatoria;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoRegistro getTipoRegistro() {
        return tipoRegistro;
    }

    public void setTipoRegistro(TipoRegistro tipoRegistro) {
        this.tipoRegistro = tipoRegistro;
    }

    public CategoriaRegistro getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaRegistro categoria) {
        this.categoria = categoria;
    }

    public int getDiaDoMes() {
        return diaDoMes;
    }

    public void setDiaDoMes(int diaDoMes) {
        this.diaDoMes = diaDoMes;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public boolean isConfirmacaoObrigatoria() {
        return confirmacaoObrigatoria;
    }

    public void setConfirmacaoObrigatoria(boolean confirmacaoObrigatoria) {
        this.confirmacaoObrigatoria = confirmacaoObrigatoria;
    }
}
