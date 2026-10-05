package net.javaguides.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponse {

    private Long organizationId;
    private String organizationName;

    private Long userId;
    private String username;
    private String email;
    private String role;

    private String message;
}