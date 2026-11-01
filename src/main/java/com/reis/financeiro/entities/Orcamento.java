package com.reis.financeiro.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "orcamento",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_orcamento_user_categoria_mes",
                columnNames = {"user_id", "categoria", "mes"}
        )
)
public class Orcamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CategoriaRegistro categoria;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate mes;

    protected Orcamento() {
    }

    public Orcamento(User user, CategoriaRegistro categoria, BigDecimal valor, LocalDate mes) {
        this.user = user;
        this.categoria = categoria;
        this.valor = valor;
        this.mes = mes;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

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

    public LocalDate getMes() {
        return mes;
    }
}
