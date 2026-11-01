package com.reis.financeiro.dto.request;

import jakarta.validation.constraints.NotNull;

public class RecorrenciaStatusDTO {
    @NotNull
    private Boolean ativa;

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }
}
