package com.reis.financeiro;

import com.reis.financeiro.dto.request.OrcamentoCreateDTO;
import com.reis.financeiro.dto.request.RecorrenciaCreateDTO;
import com.reis.financeiro.entities.CategoriaRegistro;
import com.reis.financeiro.entities.Registro;
import com.reis.financeiro.entities.TipoRegistro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.repository.OrcamentoRepository;
import com.reis.financeiro.repository.RecorrenciaRepository;
import com.reis.financeiro.repository.RegistroRepository;
import com.reis.financeiro.repository.SaldoRepository;
import com.reis.financeiro.repository.UserRepository;
import com.reis.financeiro.service.OrcamentoService;
import com.reis.financeiro.service.RecorrenciaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class FinanceiroPlanejamentoTest {
    @Autowired
    private OrcamentoService orcamentoService;

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @Autowired
    private RecorrenciaService recorrenciaService;

    @Autowired
    private RecorrenciaRepository recorrenciaRepository;

    @Autowired
    private RegistroRepository registroRepository;

    @Autowired
    private SaldoRepository saldoRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void prepararBancoDeTeste() {
        recorrenciaRepository.deleteAll();
        orcamentoRepository.deleteAll();
        registroRepository.deleteAll();
        saldoRepository.deleteAll();
        userRepository.deleteAll();
        user = userRepository.save(new User("Planejamento", "planejamento-test@email.com", "senha-hash"));
    }

    @Test
    void atualizaOrcamentoDaCategoriaEIsolaPorMesEUsuario() {
        YearMonth mesAtual = YearMonth.now();
        OrcamentoCreateDTO dados = orcamento(CategoriaRegistro.MORADIA, "1200.00", mesAtual);

        orcamentoService.salvar(user.getUserId(), dados);
        dados.setValor(new BigDecimal("1350.00"));
        orcamentoService.salvar(user.getUserId(), dados);

        assertEquals(1, orcamentoService.listar(user.getUserId(), mesAtual).size());
        assertEquals(new BigDecimal("1350.00"),
                orcamentoService.listar(user.getUserId(), mesAtual).getFirst().getValor());
        assertTrue(orcamentoService.listar(user.getUserId(), mesAtual.plusMonths(1)).isEmpty());

        User outroUsuario = userRepository.save(new User("Outro", "outro-planejamento@email.com", "senha-hash"));
        assertTrue(orcamentoService.listar(outroUsuario.getUserId(), mesAtual).isEmpty());
    }

    @Test
    void processaRecorrenciaAutomaticaSemDuplicarEAtualizaSaldo() {
        LocalDate hoje = LocalDate.now();
        RecorrenciaCreateDTO dados = recorrencia(hoje, false);
        recorrenciaService.criar(user.getUserId(), dados);

        assertEquals(1, recorrenciaService.processarAutomaticasVencidas(hoje));
        assertEquals(0, recorrenciaService.processarAutomaticasVencidas(hoje));

        Registro registro = registroRepository.findByUserId(user.getUserId()).getFirst();
        assertEquals("Conta recorrente", registro.getNome());
        assertEquals(CategoriaRegistro.CONTAS, registro.getCategoria());
        assertEquals(hoje, registro.getData());
        assertEquals(new BigDecimal("-85.00"),
                saldoRepository.findByUserId(user.getUserId()).orElseThrow().getSaldo());
        assertEquals(YearMonth.from(hoje).plusMonths(1).atDay(
                Math.min(hoje.getDayOfMonth(), YearMonth.from(hoje).plusMonths(1).lengthOfMonth())),
                recorrenciaService.listar(user.getUserId()).getFirst().getProximaExecucao());
    }

    @Test
    void recorrenciaComRevisaoNaoLancaAteConfirmacaoDoUsuario() {
        LocalDate hoje = LocalDate.now();
        RecorrenciaCreateDTO dados = recorrencia(hoje, true);
        var recorrencia = recorrenciaService.criar(user.getUserId(), dados);

        assertEquals(0, recorrenciaService.processarAutomaticasVencidas(hoje));
        assertTrue(registroRepository.findByUserId(user.getUserId()).isEmpty());
        assertEquals(0, saldoRepository.count());

        recorrenciaService.executarProxima(recorrencia.getId(), user.getUserId());

        assertEquals(1, registroRepository.findByUserId(user.getUserId()).size());
        assertEquals(new BigDecimal("-85.00"),
                saldoRepository.findByUserId(user.getUserId()).orElseThrow().getSaldo());
    }

    private OrcamentoCreateDTO orcamento(CategoriaRegistro categoria, String valor, YearMonth mes) {
        OrcamentoCreateDTO dados = new OrcamentoCreateDTO();
        dados.setCategoria(categoria);
        dados.setValor(new BigDecimal(valor));
        dados.setMes(mes.toString());
        return dados;
    }

    private RecorrenciaCreateDTO recorrencia(LocalDate inicio, boolean confirmar) {
        RecorrenciaCreateDTO dados = new RecorrenciaCreateDTO();
        dados.setNome("Conta recorrente");
        dados.setValor(new BigDecimal("85.00"));
        dados.setDescricao("Conta mensal");
        dados.setTipoRegistro(TipoRegistro.GASTO);
        dados.setCategoria(CategoriaRegistro.CONTAS);
        dados.setDiaDoMes(inicio.getDayOfMonth());
        dados.setDataInicio(inicio);
        dados.setConfirmacaoObrigatoria(confirmar);
        return dados;
    }
}
