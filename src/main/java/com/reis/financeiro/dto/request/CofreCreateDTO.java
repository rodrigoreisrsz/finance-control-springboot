package com.reis.financeiro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CofreCreateDTO {
    private Long userId;
    @NotBlank
    private String nome;
    @Positive
    private BigDecimal meta;
    private BigDecimal deposito;

}
