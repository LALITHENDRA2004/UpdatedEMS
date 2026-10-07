package net.javaguides.ems.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import net.javaguides.ems.entity.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String jobTitle;
    private BigDecimal salary;
    private LocalDate dateOfJoining;
    private EmployeeStatus status;
    private Long organizationId;
    private Long departmentId; 
    private String departmentName;
}