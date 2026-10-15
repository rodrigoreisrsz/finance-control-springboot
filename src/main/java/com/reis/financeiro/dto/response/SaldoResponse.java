package com.reis.financeiro.dto.response;

import com.reis.financeiro.entities.Saldo;
import java.math.BigDecimal;


public class SaldoResponse {

    private Long id;
    private BigDecimal saldo;


    public SaldoResponse(Saldo saldo) {
        this.id = saldo.getId();
        this.saldo = saldo.getSaldo();

    }

    public SaldoResponse() {

    }
}
