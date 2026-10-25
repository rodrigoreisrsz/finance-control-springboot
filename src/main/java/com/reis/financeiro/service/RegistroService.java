package com.reis.financeiro.service;

import com.reis.financeiro.dto.response.RegistroResponse;
import com.reis.financeiro.entities.Registro;
import com.reis.financeiro.entities.TipoRegistro;
import com.reis.financeiro.entities.User;
import com.reis.financeiro.exceptions.RegistroNotFoundException;
import com.reis.financeiro.repository.RegistroRepository;
import com.reis.financeiro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

    @Service
    public class RegistroService {
        private final RegistroRepository repository;
        private final SaldoService saldoService;
        private final UserRepository userRepository;

        @Autowired
        public RegistroService(RegistroRepository repository, SaldoService saldoService, UserRepository userRepository){
            this.repository = repository;
            this.saldoService = saldoService;
            this.userRepository = userRepository;
        }

        public List<RegistroResponse> listarRegistros(Long userId){
            List<RegistroResponse> registros = repository.findByUserId(userId).stream()
                    .map(r -> new RegistroResponse(r))
                    .toList();
            return registros;
        }

        @Transactional
        public RegistroResponse adicionarRegistro(Long userId, String nome, BigDecimal valor, String descricao, LocalDate data, TipoRegistro tipoRegistro){
            User userExists = userRepository.findByIdForUpdate(userId)
                    .orElseThrow(() -> new RuntimeException("User inexistente."));
            Registro registro = new Registro(userExists, nome, valor,  descricao, data, tipoRegistro);

            saldoService.atualizarSaldo(userExists, valor, tipoRegistro);
            Registro registroSalvo = repository.save(registro);
            return new RegistroResponse(registroSalvo);
        }

        @Transactional
        public void deletarRegistro(long id, Long userId){
            userRepository.findByIdForUpdate(userId)
                    .orElseThrow(() -> new RuntimeException("Registro não encontrado."));
            Registro registro = repository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new RuntimeException("Registro não encontrado."));

            TipoRegistro tipoInvertido = (registro.getTipoRegistro() == TipoRegistro.GANHO) ? TipoRegistro.GASTO : TipoRegistro.GANHO;

            saldoService.atualizarSaldo(registro.getUser(), registro.getValor(), tipoInvertido);

            repository.delete(registro);

        }
        public RegistroResponse buscarPorId(long id, long userId){
            Registro registro = repository.findByIdAndUserId(id, userId).orElseThrow(()-> new RegistroNotFoundException());
            return new RegistroResponse(registro);
        }
        @Transactional
        public RegistroResponse editar(long id, long userId,  String nome, BigDecimal valor, String descricao, LocalDate data, TipoRegistro tipoRegistroDTO ){
            userRepository.findByIdForUpdate(userId)
                    .orElseThrow(() -> new RuntimeException("Registro não encontrado."));
            Registro registroExistente = repository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new RuntimeException("Registro não encontrado."));


            TipoRegistro tipoInvertidoAntigo = (registroExistente.getTipoRegistro() == TipoRegistro.GANHO)
                    ? TipoRegistro.GASTO
                    : TipoRegistro.GANHO;
            saldoService.atualizarSaldo(registroExistente.getUser(), registroExistente.getValor(), tipoInvertidoAntigo);

            registroExistente.setNome(nome);
            registroExistente.setData(data);
            registroExistente.setValor(valor);
            registroExistente.setDescricao(descricao);
            registroExistente.setTipoRegistro(tipoRegistroDTO);
            saldoService.atualizarSaldo(registroExistente.getUser(), valor, tipoRegistroDTO);
            repository.save(registroExistente);
            return new RegistroResponse(registroExistente);


        }


}
