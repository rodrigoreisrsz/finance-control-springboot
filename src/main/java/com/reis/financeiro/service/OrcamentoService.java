package com.reis.financeiro.service;

import com.reis.financeiro.dto.request.OrcamentoCreateDTO;
import com.reis.financeiro.dto.response.OrcamentoResponse;
import com.reis.financeiro.entities.CategoriaRegistro;
import com.reis.financeiro.entities.Orcamento;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.exceptions.RegistroNotFoundException;
import com.reis.financeiro.repository.OrcamentoRepository;
import com.reis.financeiro.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class OrcamentoService {
    private final OrcamentoRepository orcamentoRepository;
    private final UserRepository userRepository;

    public OrcamentoService(OrcamentoRepository orcamentoRepository, UserRepository userRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<OrcamentoResponse> listar(Long userId, YearMonth mes) {
        return orcamentoRepository.findByUser_UserIdAndMesOrderByCategoria(userId, mes.atDay(1))
                .stream()
                .map(OrcamentoResponse::new)
                .toList();
    }

    @Transactional
    public OrcamentoResponse salvar(Long userId, OrcamentoCreateDTO dados) {
        if (dados.getCategoria() == CategoriaRegistro.RECEITAS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Orçamentos são exclusivos para despesas.");
        }
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RegistroNotFoundException());
        YearMonth mes = YearMonth.parse(dados.getMes());
        LocalDate primeiroDia = mes.atDay(1);

        Orcamento orcamento = orcamentoRepository
                .findByUser_UserIdAndMesAndCategoria(userId, primeiroDia, dados.getCategoria())
                .orElseGet(() -> new Orcamento(user, dados.getCategoria(), dados.getValor(), primeiroDia));
        orcamento.setValor(dados.getValor());
        return new OrcamentoResponse(orcamentoRepository.save(orcamento));
    }

    @Transactional
    public void excluir(Long id, Long userId) {
        Orcamento orcamento = orcamentoRepository.findByIdAndUser_UserId(id, userId)
                .orElseThrow(() -> new RegistroNotFoundException());
        orcamentoRepository.delete(orcamento);
    }
}
