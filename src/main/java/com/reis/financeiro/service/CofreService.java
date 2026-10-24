
package com.reis.financeiro.service;

import com.reis.financeiro.dto.response.CofreResponse;
import com.reis.financeiro.entities.Aporte;
import com.reis.financeiro.entities.Cofre;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.repository.AporteRepository;
import com.reis.financeiro.repository.CofreRepository;
import com.reis.financeiro.repository.UserRepository;

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

    public CofreService(
            CofreRepository repository,
            UserRepository userRepository,
            AporteRepository aporteRepository
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.aporteRepository = aporteRepository;
    }

    // Listar os cofres do usuário com o valorAtual calculado
    @Transactional(readOnly = true)
    public List<CofreResponse> listarMetas(Long userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(cofre -> {
                    BigDecimal valorAtual =
                            calcularTotal(cofre.getId(), userId);

                    return new CofreResponse(cofre, valorAtual);
                })
                .toList();
    }

    // Buscar um cofre específico, verificando o proprietário
    @Transactional(readOnly = true)
    public CofreResponse buscarPorId(long id, long userId) {
        Cofre cofre = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Este cofre de metas não existe."
                        )
                );

        BigDecimal valorAtual = calcularTotal(id, userId);

        return new CofreResponse(cofre, valorAtual);
    }

    // Criar um cofre associado ao usuário informado
    @Transactional
    public CofreResponse criarCofre(
            Long userId,
            String nome,
            BigDecimal meta,
            BigDecimal deposito
    ) {
        User userExists = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User inexistente.")
                );

        Cofre cofre = new Cofre(userExists, nome, meta);
        Cofre cofreSalvo = repository.save(cofre);

        return new CofreResponse(cofreSalvo, BigDecimal.ZERO);
    }
    public List<Aporte> listarAportes(long userId) {
        return aporteRepository.findByCofreUserId(userId);
    }

    // Editar somente um cofre pertencente ao usuário
    @Transactional
    public CofreResponse editar(
            Long id,
            long userId,
            String nome,
            BigDecimal meta
    ) {
        Cofre cofreExistente = repository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Cofre não encontrado.")
                );

        cofreExistente.setNome(nome);
        cofreExistente.setMeta(meta);

        Cofre cofreSalvo = repository.save(cofreExistente);
        BigDecimal valorAtual = calcularTotal(id, userId);

        return new CofreResponse(cofreSalvo, valorAtual);
    }

    // Excluir somente um cofre pertencente ao usuário
    @Transactional
    public void deletar(Long id, long userId) {
        Cofre cofre = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Este cofre de metas não existe."
                        )
                );

        repository.delete(cofre);
    }

    // Criar um aporte somente em um cofre do usuário
    @Transactional
    public CofreResponse criarAporte(
            Long cofreId,
            long userId,
            BigDecimal valor,
            LocalDate data
    ) {
        Cofre cofre = repository
                .findByIdAndUserId(cofreId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Este cofre de metas não existe."
                        )
                );

        Aporte aporte = new Aporte(valor, data, cofre);
        aporteRepository.save(aporte);

        // Atualizar o total após salvar o aporte
        BigDecimal valorAtual = calcularTotal(cofreId, userId);

        return new CofreResponse(cofre, valorAtual);
    }

    // Excluir somente um aporte vinculado a um cofre do usuário
    @Transactional
    public void deletarAporte(long id, long userId) {
        Aporte aporte = aporteRepository
                .findByIdAndCofreUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Este aporte não existe.")
                );

        aporteRepository.delete(aporte);
    }

    // Somar os aportes de um cofre, respeitando o proprietário
    @Transactional(readOnly = true)
    public BigDecimal calcularTotal(Long cofreId, long userId) {
        List<Aporte> aportes =
                aporteRepository.findByCofreIdAndCofreUserId(
                        cofreId,
                        userId
                );

        return aportes.stream()
                .map(Aporte::getValor)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
