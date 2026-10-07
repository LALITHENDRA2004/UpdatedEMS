package net.javaguides.ems.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.javaguides.ems.dto.CreateEmployeeRequest;
import net.javaguides.ems.dto.EmployeeResponse;
import net.javaguides.ems.dto.PageResponse;
import net.javaguides.ems.dto.UpdateEmployeeRequest;
import net.javaguides.ems.entity.EmployeeStatus;
import net.javaguides.ems.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@Validated
public class EmployeeController {

        private final EmployeeService employeeService;

        public EmployeeController(
                        EmployeeService employeeService) {

                this.employeeService = employeeService;
        }

        @PostMapping
        @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'HR')")
        public ResponseEntity<EmployeeResponse> createEmployee(
                        @Valid @RequestBody CreateEmployeeRequest request) {

                EmployeeResponse response = employeeService.createEmployee(request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @GetMapping
        @PreAuthorize("hasAnyRole(" +
                        "'OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'" +
                        ")")
        public ResponseEntity<PageResponse<EmployeeResponse>> getEmployees(

                        @RequestParam(required = false) String name,

                        @RequestParam(required = false) String department,

                        @RequestParam(required = false) EmployeeStatus status,

                        @RequestParam(defaultValue = "0") int page,

                        @RequestParam(defaultValue = "20") int size,

                        @RequestParam(defaultValue = "firstName") String sort,

                        @RequestParam(defaultValue = "asc") String direction) {

                return ResponseEntity.ok(
                                employeeService.searchEmployees(
                                                name,
                                                department,
                                                status,
                                                page,
                                                size,
                                                sort,
                                                direction));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole(" +
                        "'OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'" +
                        ")")
        public ResponseEntity<EmployeeResponse> getEmployeeById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                employeeService.getEmployeeById(id));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'HR')")
        public ResponseEntity<EmployeeResponse> updateEmployee(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateEmployeeRequest request) {

                return ResponseEntity.ok(
                                employeeService.updateEmployee(id, request));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
        public ResponseEntity<Void> deleteEmployee(
                        @PathVariable Long id) {

                employeeService.deleteEmployee(id);

                return ResponseEntity.noContent().build();
        }
}