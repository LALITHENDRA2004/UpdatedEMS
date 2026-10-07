package net.javaguides.ems.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.javaguides.ems.entity.Role;

@Getter
@AllArgsConstructor
public class InvitationResponse {

    private Long id;
    private String email;
    private Role role;
    private String invitationToken;
    private LocalDateTime expiresAt;
    private String message;
}