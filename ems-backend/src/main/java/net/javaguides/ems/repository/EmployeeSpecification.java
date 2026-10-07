package net.javaguides.ems.repository;

import org.springframework.data.jpa.domain.Specification;

import net.javaguides.ems.entity.Employee;
import net.javaguides.ems.entity.EmployeeStatus;

public class EmployeeSpecification {

    public static Specification<Employee>
            hasOrganization(Long organizationId) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("organization").get("id"),
                        organizationId
                );
    }

    public static Specification<Employee>
            hasName(String name) {

        return (root, query, criteriaBuilder) -> {

            String pattern = "%" +
                    name.toLowerCase() +
                    "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("firstName")
                            ),
                            pattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("lastName")
                            ),
                            pattern
                    )
            );
        };
    }

    public static Specification<Employee>
            hasDepartment(String department) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                root.get("department")
                                        .get("name")
                        ),
                        department.toLowerCase()
                );
    }

    public static Specification<Employee>
            hasStatus(EmployeeStatus status) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("status"),
                        status
                );
    }
}