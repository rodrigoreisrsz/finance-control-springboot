package com.reis.financeiro.service;

import com.reis.financeiro.dto.request.RecorrenciaCreateDTO;
import com.reis.financeiro.dto.response.RecorrenciaResponse;
import com.reis.financeiro.entities.CategoriaRegistro;
import com.reis.financeiro.entities.Recorrencia;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.exceptions.RegistroNotFoundException;
import com.reis.financeiro.repository.RecorrenciaRepository;
import com.reis.financeiro.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class RecorrenciaService {
    private final RecorrenciaRepository recorrenciaRepository;
    private final UserRepository userRepository;
    private final RegistroService registroService;

    public RecorrenciaService(RecorrenciaRepository recorrenciaRepository, UserRepository userRepository,
                              RegistroService registroService) {
        this.recorrenciaRepository = recorrenciaRepository;
        this.userRepository = userRepository;
        this.registroService = registroService;
    }

    @Transactional(readOnly = true)
    public List<RecorrenciaResponse> listar(Long userId) {
        return recorrenciaRepository.findByUser_UserIdOrderByProximaExecucaoAsc(userId)
                .stream()
                .map(RecorrenciaResponse::new)
                .toList();
    }

    @Transactional
    public RecorrenciaResponse criar(Long userId, RecorrenciaCreateDTO dados) {
        User user = userRepository.findById(userId)
                .orElseThrow(RegistroNotFoundException::new);
        LocalDate primeiraExecucao = calcularPrimeiraExecucao(dados.getDataInicio(), dados.getDiaDoMes());
        Recorrencia recorrencia = new Recorrencia(
                user,
                dados.getNome().trim(),
                dados.getValor(),
                dados.getDescricao() == null ? "" : dados.getDescricao().trim(),
                dados.getTipoRegistro(),
                dados.getCategoria() == null ? CategoriaRegistro.OUTROS : dados.getCategoria(),
                dados.getDiaDoMes(),
                dados.getDataInicio(),
                primeiraExecucao,
                dados.isConfirmacaoObrigatoria()
        );
        return new RecorrenciaResponse(recorrenciaRepository.save(recorrencia));
    }

    @Transactional
    public RecorrenciaResponse alterarStatus(Long id, Long userId, boolean ativa) {
        Recorrencia recorrencia = recorrenciaRepository.findByIdAndUserForUpdate(id, userId)
                .orElseThrow(RegistroNotFoundException::new);
        if (ativa && !recorrencia.isAtiva() && !recorrencia.getProximaExecucao().isAfter(LocalDate.now())) {
            LocalDate proxima = recorrencia.getProximaExecucao();
            while (!proxima.isAfter(LocalDate.now())) {
                proxima = proximaData(proxima, recorrencia.getDiaDoMes());
            }
            recorrencia.setProximaExecucao(proxima);
        }
        recorrencia.setAtiva(ativa);
        return new RecorrenciaResponse(recorrenciaRepository.save(recorrencia));
    }

    @Transactional
    public void excluir(Long id, Long userId) {
        Recorrencia recorrencia = recorrenciaRepository.findByIdAndUserForUpdate(id, userId)
                .orElseThrow(RegistroNotFoundException::new);
        recorrenciaRepository.delete(recorrencia);
    }

    @Transactional
    public void executarProxima(Long id, Long userId) {
        Recorrencia recorrencia = recorrenciaRepository.findByIdAndUserForUpdate(id, userId)
                .orElseThrow(RegistroNotFoundException::new);
        LocalDate hoje = LocalDate.now();
        if (!recorrencia.isAtiva() || !recorrencia.isConfirmacaoObrigatoria()
                || recorrencia.getProximaExecucao().isAfter(hoje)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este lançamento ainda não está aguardando revisão.");
        }

        registrar(recorrencia, recorrencia.getProximaExecucao());
        recorrencia.setProximaExecucao(proximaData(recorrencia.getProximaExecucao(), recorrencia.getDiaDoMes()));
        recorrenciaRepository.save(recorrencia);
    }

    @Transactional
    public int processarAutomaticasVencidas(LocalDate hoje) {
        List<Recorrencia> vencidas = recorrenciaRepository.findAutomaticasVencidasForUpdate(hoje);
        int registrosCriados = 0;
        for (Recorrencia recorrencia : vencidas) {
            while (!recorrencia.getProximaExecucao().isAfter(hoje)) {
                registrar(recorrencia, recorrencia.getProximaExecucao());
                recorrencia.setProximaExecucao(
                        proximaData(recorrencia.getProximaExecucao(), recorrencia.getDiaDoMes()));
                registrosCriados++;
            }
            recorrenciaRepository.save(recorrencia);
        }
        return registrosCriados;
    }

    static LocalDate calcularPrimeiraExecucao(LocalDate inicio, int diaDoMes) {
        YearMonth mesInicial = YearMonth.from(inicio);
        LocalDate candidato = dataNoMes(mesInicial, diaDoMes);
        return candidato.isBefore(inicio) ? dataNoMes(mesInicial.plusMonths(1), diaDoMes) : candidato;
    }

    static LocalDate proximaData(LocalDate atual, int diaDoMes) {
        return dataNoMes(YearMonth.from(atual).plusMonths(1), diaDoMes);
    }

    private static LocalDate dataNoMes(YearMonth mes, int diaDoMes) {
        return mes.atDay(Math.min(diaDoMes, mes.lengthOfMonth()));
    }

    private void registrar(Recorrencia recorrencia, LocalDate data) {
        registroService.adicionarRegistro(
                recorrencia.getUser().getUserId(),
                recorrencia.getNome(),
                recorrencia.getValor(),
                recorrencia.getDescricao(),
                data,
                recorrencia.getTipoRegistro(),
                recorrencia.getCategoria()
        );
    }
}
