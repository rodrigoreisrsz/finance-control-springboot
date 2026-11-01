package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.Recorrencia;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecorrenciaResponse {
    private final Long id;
    private final String nome;
    private final BigDecimal valor;
    private final String descricao;
    private final String tipoRegistro;
    private final String categoria;
    private final int diaDoMes;
    private final LocalDate dataInicio;
    private final LocalDate proximaExecucao;
    private final boolean ativa;
    private final boolean confirmacaoObrigatoria;
    private final boolean aguardandoRevisao;

    public RecorrenciaResponse(Recorrencia recorrencia) {
        this.id = recorrencia.getId();
        this.nome = recorrencia.getNome();
        this.valor = recorrencia.getValor();
        this.descricao = recorrencia.getDescricao();
        this.tipoRegistro = recorrencia.getTipoRegistro().name();
        this.categoria = recorrencia.getCategoria().name();
        this.diaDoMes = recorrencia.getDiaDoMes();
        this.dataInicio = recorrencia.getDataInicio();
        this.proximaExecucao = recorrencia.getProximaExecucao();
        this.ativa = recorrencia.isAtiva();
        this.confirmacaoObrigatoria = recorrencia.isConfirmacaoObrigatoria();
        this.aguardandoRevisao = recorrencia.isAtiva()
                && recorrencia.isConfirmacaoObrigatoria()
                && !recorrencia.getProximaExecucao().isAfter(LocalDate.now());
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getTipoRegistro() {
        return tipoRegistro;
    }

    public String getCategoria() {
        return categoria;
    }

    public int getDiaDoMes() {
        return diaDoMes;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getProximaExecucao() {
        return proximaExecucao;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public boolean isConfirmacaoObrigatoria() {
        return confirmacaoObrigatoria;
    }

    public boolean isAguardandoRevisao() {
        return aguardandoRevisao;
    }
}
