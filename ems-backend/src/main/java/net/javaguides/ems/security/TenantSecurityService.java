package net.javaguides.ems.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import net.javaguides.ems.exception.UnauthorizedException;

@Component("tenantSecurity")
public class TenantSecurityService {
    public AuthenticatedUser getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new UnauthorizedException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof AuthenticatedUser user)) {

            throw new UnauthorizedException(
                    "Invalid authenticated user"
            );
        }

        return user;
    }

    public boolean canAccessOrganization(Long organizationId) {
        return getCurrentUser() 
            .organizationId() 
            .equals(organizationId);
    }

    public Long getCurrentOrganizationId() {
        return getCurrentUser() 
            .organizationId();
    }
}