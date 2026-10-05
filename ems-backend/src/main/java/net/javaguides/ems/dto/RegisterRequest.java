package net.javaguides.ems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 100, message = "Organization name must not exceed 100 characters")
    private String organizationName;

    @NotBlank(message = "Organization email is required")
    @Email(message = "Invalid organization email")
    @Size(max = 150, message = "Organization email must not exceed 150 characters")
    private String organizationEmail;

    @NotBlank(message = "Owner username is required")
    @Size(min = 3, max = 50,
            message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Invalid owner email")
    @Size(max = 150, message = "Owner email must not exceed 150 characters")
    private String ownerEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100,
            message = "Password must be between 8 and 100 characters")
    private String password;
}