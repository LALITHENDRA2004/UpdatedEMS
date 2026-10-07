package net.javaguides.ems.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.CreateEmployeeRequest;
import net.javaguides.ems.dto.EmployeeResponse;
import net.javaguides.ems.dto.PageResponse;
import net.javaguides.ems.dto.UpdateEmployeeRequest;
import net.javaguides.ems.entity.Department;
import net.javaguides.ems.entity.Employee;
import net.javaguides.ems.entity.EmployeeStatus;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.exception.DuplicateResourceException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.DepartmentRepository;
import net.javaguides.ems.repository.EmployeeRepository;
import net.javaguides.ems.repository.EmployeeSpecification;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.security.TenantSecurityService;

@Service
public class EmployeeService {

        private final EmployeeRepository employeeRepository;
        private final OrganizationRepository organizationRepository;
        private final DepartmentRepository departmentRepository;
        private final TenantSecurityService tenantSecurityService;

        private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
                        "firstName",
                        "lastName",
                        "email",
                        "salary",
                        "dateOfJoining",
                        "status");

        public EmployeeService(
                        EmployeeRepository employeeRepository,
                        OrganizationRepository organizationRepository,
                        DepartmentRepository departmentRepository,
                        TenantSecurityService tenantSecurityService) {

                this.employeeRepository = employeeRepository;
                this.organizationRepository = organizationRepository;
                this.departmentRepository = departmentRepository;
                this.tenantSecurityService = tenantSecurityService;
        }

        @Transactional
        public EmployeeResponse createEmployee(
                        CreateEmployeeRequest request) {

                Long organizationId = tenantSecurityService
                                .getCurrentOrganizationId();

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                if (employeeRepository
                                .existsByEmailAndOrganizationId(
                                                email,
                                                organizationId)) {

                        throw new DuplicateResourceException(
                                "Employee with this email already exists");
                }

                Organization organization = organizationRepository
                                .findById(organizationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Organization not found"));

                Employee employee = new Employee();

                employee.setFirstName(
                                request.getFirstName().trim());

                employee.setLastName(
                                request.getLastName().trim());

                employee.setEmail(email);

                employee.setPhone(
                                request.getPhone());

                employee.setJobTitle(
                                request.getJobTitle().trim());

                employee.setSalary(
                                request.getSalary());

                employee.setDateOfJoining(
                                request.getDateOfJoining());

                employee.setStatus(
                                EmployeeStatus.ACTIVE);

                employee.setOrganization(
                                organization);

                if (request.getDepartmentId() != null) {

                        Department department = departmentRepository
                                        .findByIdAndOrganizationId(
                                                        request.getDepartmentId(),
                                                        organizationId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Department not found"));

                        employee.setDepartment(department);
                }

                Employee savedEmployee = employeeRepository.save(employee);

                return toResponse(savedEmployee);
        }

        @Transactional(readOnly = true)
        public List<EmployeeResponse> getAllEmployees() {

                Long organizationId = tenantSecurityService
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

                Long organizationId = tenantSecurityService
                                .getCurrentOrganizationId();

                Employee employee = employeeRepository
                                .findByIdAndOrganizationId(
                                                employeeId,
                                                organizationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Employee not found"));

                return toResponse(employee);
        }

        @Transactional
        public EmployeeResponse updateEmployee(
                        Long employeeId,
                        UpdateEmployeeRequest request) {

                Long organizationId = tenantSecurityService
                                .getCurrentOrganizationId();

                Employee employee = employeeRepository
                                .findByIdAndOrganizationId(
                                                employeeId,
                                                organizationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Employee not found"));

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                boolean emailChanged = !employee.getEmail()
                                .equalsIgnoreCase(email);

                if (emailChanged &&
                                employeeRepository
                                                .existsByEmailAndOrganizationIdAndIdNot(
                                                                email,
                                                                organizationId,
                                                                employeeId)) {

                        throw new DuplicateResourceException(
                                        "Employee email already exists");
                }

                employee.setFirstName(
                                request.getFirstName().trim());

                employee.setLastName(
                                request.getLastName().trim());

                employee.setEmail(email);

                employee.setPhone(
                                request.getPhone());

                employee.setJobTitle(
                                request.getJobTitle().trim());

                employee.setSalary(
                                request.getSalary());

                employee.setDateOfJoining(
                                request.getDateOfJoining());

                if (request.getDepartmentId() != null) {

                        Department department = departmentRepository
                                        .findByIdAndOrganizationId(
                                                        request.getDepartmentId(),
                                                        organizationId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Department not found"));

                        employee.setDepartment(department);

                } else {

                        employee.setDepartment(null);
                }

                Employee updatedEmployee = employeeRepository.save(employee);

                return toResponse(updatedEmployee);
        }

        @Transactional
        public void deleteEmployee(Long employeeId) {

                Long organizationId = tenantSecurityService
                                .getCurrentOrganizationId();

                Employee employee = employeeRepository
                                .findByIdAndOrganizationId(
                                                employeeId,
                                                organizationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Employee not found"));

                employeeRepository.delete(employee);
        }

        @Transactional(readOnly = true)
        public PageResponse<EmployeeResponse> searchEmployees(
                        String name,
                        String department,
                        EmployeeStatus status,
                        int page,
                        int size,
                        String sortBy,
                        String direction) {

                if (page < 0) {

                        throw new IllegalArgumentException(
                                        "Page must be greater than or equal to 0");
                }

                if (size < 1 || size > 100) {
                        throw new IllegalArgumentException(
                                        "Size must be between 1 and 100");
                }

                if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
                        throw new IllegalArgumentException(
                                        "Invalid sort field");
                }

                Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction)
                                ? Sort.Direction.DESC
                                : Sort.Direction.ASC;

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by(
                                                sortDirection,
                                                sortBy));

                Long organizationId = tenantSecurityService
                                .getCurrentOrganizationId();

                Specification<Employee> specification = EmployeeSpecification
                                .hasOrganization(
                                                organizationId);

                if (name != null &&
                                !name.isBlank()) {

                        specification = specification.and(
                                        EmployeeSpecification.hasName(
                                                        name.trim()));
                }

                if (department != null &&
                                !department.isBlank()) {

                        specification = specification.and(
                                        EmployeeSpecification.hasDepartment(
                                                        department.trim()));
                }

                if (status != null) {
                        specification = specification.and(
                                        EmployeeSpecification.hasStatus(
                                                        status));
                }

                Page<Employee> employeePage = employeeRepository.findAll(
                                specification,
                                pageable);

                List<EmployeeResponse> content = employeePage
                                .getContent()
                                .stream()
                                .map(this::toResponse)
                                .toList();

                return new PageResponse<>(
                                content,
                                employeePage.getNumber(),
                                employeePage.getSize(),
                                employeePage.getTotalElements(),
                                employeePage.getTotalPages(),
                                employeePage.isFirst(),
                                employeePage.isLast());
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
                                employee.getOrganization().getId(),

                                employee.getDepartment() != null
                                                ? employee.getDepartment().getId()
                                                : null,

                                employee.getDepartment() != null
                                                ? employee.getDepartment().getName()
                                                : null);
        }
}