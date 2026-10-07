package net.javaguides.ems.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.javaguides.ems.entity.Role;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private Long organizationId;
    private LocalDateTime createdAt;
}