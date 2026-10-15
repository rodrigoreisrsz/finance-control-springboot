package com.reis.financeiro.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Cofre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    @JoinColumn(name = "user_id")

    private User user;
    private String nome;
    private BigDecimal meta;

    @OneToMany(mappedBy = "cofre")
    private List<Aporte> aportes = new ArrayList<>();


    public Cofre(User user, String nome, BigDecimal meta) {
        this.user = user;
        this.nome = nome;
        this.meta = meta;
    }


   public Cofre(){}

    public BigDecimal getValorAtual() {
        return aportes.stream()
                .map(Aporte::getValor)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
