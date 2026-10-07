package net.javaguides.ems.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50,
            message = "First name must not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50,
            message = "Last name must not exceed 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150,
            message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 20,
            message = "Phone must not exceed 20 characters")
    private String phone;

    @NotBlank(message = "Job title is required")
    @Size(max = 100,
            message = "Job title must not exceed 100 characters")
    private String jobTitle;

    @NotNull(message = "Salary is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Salary cannot be negative"
    )
    private BigDecimal salary;

    @NotNull(message = "Date of joining is required")
    @PastOrPresent(
            message = "Date of joining cannot be in the future"
    )
    private LocalDate dateOfJoining;
}