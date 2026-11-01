package com.reis.financeiro.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recorrencia")
public class Recorrencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(length = 300)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TipoRegistro tipoRegistro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CategoriaRegistro categoria;

    @Column(nullable = false)
    private int diaDoMes;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate proximaExecucao;

    @Column(nullable = false)
    private boolean ativa = true;

    @Column(nullable = false)
    private boolean confirmacaoObrigatoria;

    protected Recorrencia() {
    }

    public Recorrencia(User user, String nome, BigDecimal valor, String descricao, TipoRegistro tipoRegistro,
                       CategoriaRegistro categoria, int diaDoMes, LocalDate dataInicio,
                       LocalDate proximaExecucao, boolean confirmacaoObrigatoria) {
        this.user = user;
        this.nome = nome;
        this.valor = valor;
        this.descricao = descricao;
        this.tipoRegistro = tipoRegistro;
        this.categoria = categoria;
        this.diaDoMes = diaDoMes;
        this.dataInicio = dataInicio;
        this.proximaExecucao = proximaExecucao;
        this.confirmacaoObrigatoria = confirmacaoObrigatoria;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
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

    public TipoRegistro getTipoRegistro() {
        return tipoRegistro;
    }

    public CategoriaRegistro getCategoria() {
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

    public void setProximaExecucao(LocalDate proximaExecucao) {
        this.proximaExecucao = proximaExecucao;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public boolean isConfirmacaoObrigatoria() {
        return confirmacaoObrigatoria;
    }
}
