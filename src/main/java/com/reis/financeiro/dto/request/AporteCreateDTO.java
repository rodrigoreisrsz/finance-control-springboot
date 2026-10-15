package com.reis.financeiro.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class AporteCreateDTO {
    private Long cofreId;
    private BigDecimal valor;
    private LocalDate data;
}
