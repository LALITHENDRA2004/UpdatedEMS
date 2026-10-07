package net.javaguides.ems.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.DepartmentRequest;
import net.javaguides.ems.dto.DepartmentResponse;
import net.javaguides.ems.entity.Department;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.exception.DuplicateResourceException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.DepartmentRepository;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.security.TenantSecurityService;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final OrganizationRepository organizationRepository;
    private final TenantSecurityService tenantSecurityService;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            OrganizationRepository organizationRepository,
            TenantSecurityService tenantSecurityService) {

        this.departmentRepository = departmentRepository;
        this.organizationRepository = organizationRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Transactional
    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        String departmentName =
                request.getName().trim();

        if (departmentRepository
                .existsByNameIgnoreCaseAndOrganizationId(
                        departmentName,
                        organizationId)) {

            throw new DuplicateResourceException(
                    "Department already exists"
            );
        }

        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found"
                                ));

        Department department = new Department();

        department.setName(departmentName);
        department.setOrganization(organization);

        Department savedDepartment =
                departmentRepository.save(department);

        return toResponse(savedDepartment);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        return departmentRepository
                .findByOrganizationId(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse updateDepartment(
            Long departmentId,
            DepartmentRequest request) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        Department department =
                departmentRepository
                        .findByIdAndOrganizationId(
                                departmentId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                ));

        String departmentName =
                request.getName().trim();

        boolean nameChanged =
                !department.getName()
                        .equalsIgnoreCase(departmentName);

        if (nameChanged &&
                departmentRepository
                        .existsByNameIgnoreCaseAndOrganizationIdAndIdNot(
                                departmentName,
                                organizationId,
                                departmentId
                        )) {

            throw new DuplicateResourceException(
                    "Department already exists"
            );
        }

        department.setName(departmentName);

        Department updatedDepartment =
                departmentRepository.save(department);

        return toResponse(updatedDepartment);
    }

    @Transactional
    public void deleteDepartment(Long departmentId) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        Department department =
                departmentRepository
                        .findByIdAndOrganizationId(
                                departmentId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found"
                                ));

        departmentRepository.delete(department);
    }

    private DepartmentResponse toResponse(
            Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getOrganization().getId(),
                department.getCreatedAt(),
                department.getUpdatedAt()
        );
    }
}