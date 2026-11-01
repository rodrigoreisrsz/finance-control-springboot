package com.reis.financeiro.entities;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Registro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String nome;
    private BigDecimal valor;
    private String descricao;
    private LocalDate data;
    @Enumerated(EnumType.STRING)
    private TipoRegistro tipoRegistro;
    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private CategoriaRegistro categoria;


    public Registro(User user, String nome, BigDecimal valor, String descricao, LocalDate data, TipoRegistro tipoRegistro) {
        this(user, nome, valor, descricao, data, tipoRegistro, CategoriaRegistro.OUTROS);
    }

    public Registro(User user, String nome, BigDecimal valor, String descricao, LocalDate data,
                    TipoRegistro tipoRegistro, CategoriaRegistro categoria) {
        this.user = user;
        this.nome = nome;
        this.valor = valor;
        this.descricao = descricao;
        this.data = data;
        this.tipoRegistro = tipoRegistro;
        this.categoria = categoria;
    }


    public Registro(){

    }

    @Override
    public String toString() {
        return "Registro{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", data='" + data + '\'' +
                ", tipoRegistro=" + tipoRegistro +
                '}';
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public TipoRegistro getTipoRegistro() {
        return tipoRegistro;
    }

    public void setTipoRegistro(TipoRegistro tipoRegistro) {
        this.tipoRegistro = tipoRegistro;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public CategoriaRegistro getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaRegistro categoria) {
        this.categoria = categoria;
    }
}
