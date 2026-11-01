package com.reis.financeiro.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class RecorrenciaScheduler {
    private final RecorrenciaService recorrenciaService;

    public RecorrenciaScheduler(RecorrenciaService recorrenciaService) {
        this.recorrenciaService = recorrenciaService;
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void processarLancamentosVencidos() {
        recorrenciaService.processarAutomaticasVencidas(LocalDate.now());
    }
}
