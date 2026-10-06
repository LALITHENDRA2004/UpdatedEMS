package net.javaguides.ems.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.javaguides.ems.entity.Department;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    List<Department> findByOrganizationId(
            Long organizationId
    );

    Optional<Department> findByIdAndOrganizationId(
            Long departmentId,
            Long organizationId
    );

    boolean existsByNameIgnoreCaseAndOrganizationId(
            String name,
            Long organizationId
    );

    boolean existsByNameIgnoreCaseAndOrganizationIdAndIdNot(
            String name,
            Long organizationId,
            Long departmentId
    );
}