package com.reis.financeiro;

import com.reis.financeiro.entities.TipoRegistro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.repository.RegistroRepository;
import com.reis.financeiro.repository.SaldoRepository;
import com.reis.financeiro.repository.UserRepository;
import com.reis.financeiro.service.RegistroService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class RegistroServiceTransactionTest {

    @Autowired
    private RegistroService registroService;

    @Autowired
    private RegistroRepository registroRepository;

    @Autowired
    private SaldoRepository saldoRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void prepararBancoDeTeste() {
        registroRepository.deleteAll();
        saldoRepository.deleteAll();
        userRepository.deleteAll();
        user = userRepository.save(new User("Teste", "registro-test@email.com", "senha-hash"));
    }

    @Test
    void atualizaSaldoERegistroNaMesmaOperacaoDeServico() {
        registroService.adicionarRegistro(
                user.getUserId(), "Entrada inicial", new BigDecimal("100.00"),
                "", LocalDate.now(), TipoRegistro.GANHO);

        long registroId = registroRepository.findByUserId(user.getUserId()).getFirst().getId();
        registroService.editar(
                registroId, user.getUserId(), "Despesa ajustada", new BigDecimal("25.00"),
                "", LocalDate.now(), TipoRegistro.GASTO);

        assertEquals(
                new BigDecimal("-25.00"),
                saldoRepository.findByUserId(user.getUserId()).orElseThrow().getSaldo());

        registroService.deletarRegistro(registroId, user.getUserId());

        assertTrue(registroRepository.findByUserId(user.getUserId()).isEmpty());
        assertEquals(
                BigDecimal.ZERO.setScale(2),
                saldoRepository.findByUserId(user.getUserId()).orElseThrow().getSaldo());
    }

    @Test
    void serializaCriacoesConcorrentesDoMesmoUsuarioSemPerderAtualizacao() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch chamadasProntas = new CountDownLatch(2);
        CountDownLatch iniciarChamadas = new CountDownLatch(1);

        try {
            Future<?> primeira = executor.submit(() -> adicionarQuandoLiberado(
                    chamadasProntas, iniciarChamadas, new BigDecimal("10.00")));
            Future<?> segunda = executor.submit(() -> adicionarQuandoLiberado(
                    chamadasProntas, iniciarChamadas, new BigDecimal("20.00")));

            assertTrue(chamadasProntas.await(5, TimeUnit.SECONDS));
            iniciarChamadas.countDown();
            primeira.get(10, TimeUnit.SECONDS);
            segunda.get(10, TimeUnit.SECONDS);

            assertEquals(2, registroRepository.findByUserId(user.getUserId()).size());
            assertEquals(
                    new BigDecimal("30.00"),
                    saldoRepository.findByUserId(user.getUserId()).orElseThrow().getSaldo());
        } finally {
            iniciarChamadas.countDown();
            executor.shutdownNow();
        }
    }

    private void adicionarQuandoLiberado(
            CountDownLatch chamadasProntas,
            CountDownLatch iniciarChamadas,
            BigDecimal valor) {
        chamadasProntas.countDown();
        try {
            if (!iniciarChamadas.await(5, TimeUnit.SECONDS)) {
                throw new IllegalStateException("As chamadas concorrentes não foram liberadas.");
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("A operação concorrente foi interrompida.", exception);
        }

        registroService.adicionarRegistro(
                user.getUserId(), "Entrada concorrente", valor, "",
                LocalDate.now(), TipoRegistro.GANHO);
    }
}
