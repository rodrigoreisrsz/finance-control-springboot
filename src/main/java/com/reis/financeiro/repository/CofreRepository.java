
        package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Cofre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CofreRepository extends JpaRepository<Cofre, Long> {

    @Query("SELECT c FROM Cofre c WHERE c.user.userId = :userId")
    List<Cofre> findByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Cofre c
        WHERE c.id = :id
          AND c.user.userId = :userId
        """)
    Optional<Cofre> findByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId
    );
}
