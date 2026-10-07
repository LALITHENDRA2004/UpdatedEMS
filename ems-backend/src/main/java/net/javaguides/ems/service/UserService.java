package net.javaguides.ems.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.UserResponse;
import net.javaguides.ems.entity.Role;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.exception.ForbiddenException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.UserRepository;
import net.javaguides.ems.security.TenantSecurityService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TenantSecurityService tenantSecurityService;

    public UserService(
            UserRepository userRepository,
            TenantSecurityService tenantSecurityService) {

        this.userRepository = userRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        return userRepository
                .findByOrganizationId(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void updateRole(
            Long userId,
            Role newRole) {

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        User currentUser =
                getCurrentUser();

        User targetUser =
                userRepository
                        .findByIdAndOrganizationId(
                                userId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                ));

        if (targetUser.getRole() == Role.OWNER) {
            throw new ForbiddenException(
                    "OWNER role cannot be changed"
            );
        }

        if (targetUser.getId()
                .equals(currentUser.getId())) {

            throw new ForbiddenException(
                    "You cannot change your own role"
            );
        }

        if (newRole == Role.OWNER) {
            throw new ForbiddenException(
                    "OWNER role cannot be assigned"
            );
        }

        if (currentUser.getRole() == Role.ADMIN &&
                newRole == Role.ADMIN) {

            throw new ForbiddenException(
                    "ADMIN cannot assign ADMIN role"
            );
        }

        targetUser.setRole(newRole);

        userRepository.save(targetUser);
    }

    private User getCurrentUser() {

        Long userId =
                tenantSecurityService
                        .getCurrentUser()
                        .userId();

        Long organizationId =
                tenantSecurityService
                        .getCurrentOrganizationId();

        return userRepository
                .findByIdAndOrganizationId(
                        userId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        ));
    }

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getOrganization().getId(),
                user.getCreatedAt()
        );
    }
}