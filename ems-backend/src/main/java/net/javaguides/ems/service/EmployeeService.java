package net.javaguides.ems.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.CreateEmployeeRequest;
import net.javaguides.ems.dto.EmployeeResponse;
import net.javaguides.ems.dto.UpdateEmployeeRequest;
import net.javaguides.ems.entity.Employee;
import net.javaguides.ems.entity.EmployeeStatus;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.exception.DuplicateResourceException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.EmployeeRepository;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.security.AuthenticatedUser;
import net.javaguides.ems.security.TenantSecurityService;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final TenantSecurityService tenantSecurityService;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            OrganizationRepository organizationRepository,
            TenantSecurityService tenantSecurityService) {

        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Transactional
    public EmployeeResponse createEmployee(
            CreateEmployeeRequest request) {

        AuthenticatedUser currentUser =
                tenantSecurityService.getCurrentUser();

        Long organizationId =
                currentUser.organizationId();

        if (employeeRepository.existsByEmailAndOrganizationId(
                request.getEmail(),
                organizationId)) {

            throw new DuplicateResourceException(
                    "Employee with this email already exists"
            );
        }

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found"
                                ));

        Employee employee = new Employee();

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());
        employee.setDateOfJoining(
                request.getDateOfJoining()
        );
        employee.setStatus(EmployeeStatus.ACTIVE);

        employee.setOrganization(organization);

        Employee savedEmployee =
                employeeRepository.save(employee);

        return toResponse(savedEmployee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        return employeeRepository
                .findByOrganizationId(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(
            Long employeeId) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        Employee employee =
                employeeRepository
                        .findByIdAndOrganizationId(
                                employeeId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found"
                                ));

        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(
            Long employeeId,
            UpdateEmployeeRequest request) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        Employee employee =
                employeeRepository
                        .findByIdAndOrganizationId(
                                employeeId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found"
                                ));

        boolean emailChanged =
                !employee.getEmail()
                        .equalsIgnoreCase(request.getEmail());

        if (emailChanged &&
                employeeRepository
                        .existsByEmailAndOrganizationIdAndIdNot(
                                request.getEmail(),
                                organizationId,
                                employeeId
                        )) {

            throw new DuplicateResourceException(
                "Employee email already exists"
            );
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());
        employee.setDateOfJoining(
                request.getDateOfJoining()
        );

        Employee updatedEmployee =
                employeeRepository.save(employee);

        return toResponse(updatedEmployee);
    }

    @Transactional
    public void deleteEmployee(Long employeeId) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        Employee employee =
                employeeRepository
                        .findByIdAndOrganizationId(
                                employeeId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found"
                                ));

        employeeRepository.delete(employee);
    }

    private EmployeeResponse toResponse(
            Employee employee) {

        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getJobTitle(),
                employee.getSalary(),
                employee.getDateOfJoining(),
                employee.getStatus(),
                employee.getOrganization().getId()
        );
    }
}