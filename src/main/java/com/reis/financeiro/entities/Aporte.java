package com.reis.financeiro.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;


@Entity
@Getter
@Setter
@Table(name = "aporte")
public class Aporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal valor;
    private LocalDate data;
    @ManyToOne
    @JoinColumn(name = "cofre_id")
    private  Cofre cofre;


    public Aporte( BigDecimal valor, LocalDate data,  Cofre cofre) {
        this.valor = valor;
        this.data = data;
        this.cofre = cofre;
    }
    public Aporte(){}

}
