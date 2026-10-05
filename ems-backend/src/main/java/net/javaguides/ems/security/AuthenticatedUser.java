package net.javaguides.ems.security;

public record AuthenticatedUser(
        Long userId,
        Long organizationId,
        String email,
        String role
) {
}