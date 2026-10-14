
package com.reis.financeiro.exceptions;
import org.springframework.web.bind.annotation.RestControllerAdvice;



import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

    @RestControllerAdvice
    public class GlobalExceptionHandler {

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, String>> handleDuplicateEntry(DataIntegrityViolationException e) {
            // Retorna um JSON estruturado com status 409 Conflict
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "E-mail já cadastrado no sistema."));
        }
    }


