package net.javaguides.ems.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.javaguides.ems.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByOrganizationId(Long organizationId);

    Optional<User> findByIdAndOrganizationId(
            Long userId,
            Long organizationId
    );
}