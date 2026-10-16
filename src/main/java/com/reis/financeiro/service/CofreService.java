package com.reis.financeiro.service;

import com.reis.financeiro.dto.response.CofreResponse;
import com.reis.financeiro.entities.Aporte;
import com.reis.financeiro.entities.Cofre;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.repository.AporteRepository;
import com.reis.financeiro.repository.CofreRepository;
import com.reis.financeiro.repository.SaldoRepository;
import com.reis.financeiro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class CofreService {
    private final CofreRepository repository;
    private final UserRepository userRepository;
    private final AporteRepository aporteRepository;
    private final SaldoRepository saldoRepository;

    @Autowired
    public CofreService(CofreRepository repository, UserRepository userRepository, SaldoRepository saldoRepository, AporteRepository aporteRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.saldoRepository = saldoRepository;
        this.aporteRepository = aporteRepository;
    }
    public List<CofreResponse> listarMetas(Long userId){
        return repository.findByUserId(userId).stream()
                .map(cofre -> {
                    BigDecimal valorAtual = calcularTotal(
                            cofre.getId(),
                            userId
                    );

                    return new CofreResponse(cofre, valorAtual);
                })
                .toList();
    }
    @Transactional(readOnly = true)
    public CofreResponse buscarPorId(long id, long userId){
        Cofre cofre = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Este cofre de metas não existe."));

        BigDecimal valorAtual = cofre.getAportes()
                .stream()
                .map(Aporte::getValor)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CofreResponse(cofre, valorAtual);
    }
    public CofreResponse criarCofre(Long userId, String nome, BigDecimal meta, BigDecimal deposito){
        User userExists = userRepository.findById(userId).orElseThrow(()-> new RuntimeException("User inexistente."));
        Cofre cofre = new Cofre(userExists, nome, meta);
        repository.save(cofre);
        return new CofreResponse(cofre);
    }
    public CofreResponse editar(Long id, long userId, String nome, BigDecimal meta){
        Cofre cofreExistente = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Cofre não encontrado."));

        cofreExistente.setNome(nome);
        cofreExistente.setMeta(meta);
        repository.save(cofreExistente);
        return new CofreResponse(cofreExistente);
    }
    public void deletar(Long id, long userId){
        Cofre cofre = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Este cofre de metas não existe."));
        repository.delete(cofre);
    }
    @Transactional
    public CofreResponse criarAporte(Long cofreId, BigDecimal valor, LocalDate data) {
        Cofre cofre = repository.findById(cofreId)
                .orElseThrow(() ->
                        new RuntimeException("Este cofre de metas não existe.")
                );

        Aporte aporte = new Aporte(valor, data, cofre);
        aporteRepository.save(aporte);

        BigDecimal valorAtual = calcularTotal(
                cofreId,
                cofre.getUser().getId()
        );

        return new CofreResponse(cofre, valorAtual);
    }
    @Transactional
    public void deletarAporte(long id, long userId) {
        Aporte aporteExists =  aporteRepository.findByIdAndCofreUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Este aporte não existe"));

        aporteRepository.delete(aporteExists);
    }
    public BigDecimal calcularTotal(Long cofreId, long userId){
        List<Aporte> aportes = aporteRepository.findByCofreIdAndCofreUserId(cofreId, userId).stream()
                .toList();
        BigDecimal valorTotal = aportes.stream()
                .map(Aporte::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return valorTotal;
    }

    // buscar toda a lista de aportes do user
    // iterar sobre cada uma e somar ao proximo valor
    // retornar uma nova lista ou retorna o variavel valor total
}
