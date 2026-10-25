package com.reis.financeiro.service;

import com.reis.financeiro.dto.response.SaldoResponse;
import com.reis.financeiro.entities.Saldo;
import com.reis.financeiro.entities.TipoRegistro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.repository.SaldoRepository;
import com.reis.financeiro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class SaldoService {
    private final SaldoRepository repository;
    private final UserRepository userRepository;

    @Autowired
    public SaldoService(SaldoRepository repository, UserRepository userRepository){
        this.repository = repository;
        this.userRepository = userRepository;
    }
    @Transactional
    public Saldo buscaOuCriaSaldo(Long userId){
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Usuário inexistente."));
        Optional<Saldo> saldoExistente = repository.findByUserId(userId);
        if(saldoExistente.isPresent()){
            return saldoExistente.get();
        }else{
            Saldo saldo = new Saldo();
            saldo.setSaldo(BigDecimal.ZERO);
            saldo.setUser(user);
            repository.save(saldo);
            return saldo;
        }


    }
    @Transactional
    public void atualizarSaldo(User user, BigDecimal valor, TipoRegistro tipo){
        Saldo saldo = buscaOuCriaSaldo(user.getUserId() );
        if(tipo == TipoRegistro.GANHO){
            saldo.setSaldo(saldo.getSaldo().add(valor));
        }else{
            saldo.setSaldo(saldo.getSaldo().subtract(valor));
        }
        repository.save(saldo);
    }
}
