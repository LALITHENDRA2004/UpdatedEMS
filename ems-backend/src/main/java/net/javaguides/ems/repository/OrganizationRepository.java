package net.javaguides.ems.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.javaguides.ems.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
}