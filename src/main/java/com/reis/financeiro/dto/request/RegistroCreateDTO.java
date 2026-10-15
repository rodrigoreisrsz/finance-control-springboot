package com.reis.financeiro.dto.request;

import com.reis.financeiro.entities.TipoRegistro;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class RegistroCreateDTO {
    private Long userId;
    @NotBlank
    private String nome;
    private LocalDate data;
    @Positive
    private BigDecimal valor;
    private String descricao;
    @Enumerated(EnumType.STRING)
    private TipoRegistro tipoRegistro;


}
