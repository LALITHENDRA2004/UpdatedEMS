package net.javaguides.ems.repository; 

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import net.javaguides.ems.entity.Employee;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
                JpaSpecificationExecutor<Employee> {
        List<Employee> findByOrganizationId(Long organizationId);
        Optional<Employee> findByIdAndOrganizationId(
                Long employeeId,
                Long organizationId
        );

        boolean existsByEmailAndOrganizationId(
                String email,
                Long organizationId
        );

        boolean existsByEmailAndOrganizationIdAndIdNot(
                String email,
                Long organizationId,
                Long employeeId
        );
}