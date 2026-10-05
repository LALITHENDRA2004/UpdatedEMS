package net.javaguides.ems.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.javaguides.ems.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByEmail(String email); 

    boolean existsByEmail(String email);
}

