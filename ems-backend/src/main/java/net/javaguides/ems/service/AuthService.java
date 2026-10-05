package net.javaguides.ems.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.RegisterRequest;
import net.javaguides.ems.dto.RegisterResponse;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.entity.Role;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.repository.UserRepository;

@Service
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (organizationRepository.existsByEmail(request.getOrganizationEmail())) {
            throw new IllegalArgumentException(
                    "Organization email already exists"
            );
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(request.getOwnerEmail())) {
            throw new IllegalArgumentException(
                    "User email already exists"
            );
        }

        Organization organization = new Organization();

        organization.setName(request.getOrganizationName());
        organization.setEmail(request.getOrganizationEmail());

        Organization savedOrganization =
                organizationRepository.save(organization);

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        User owner = new User();

        owner.setUsername(request.getUsername());
        owner.setEmail(request.getOwnerEmail());
        owner.setPasswordHash(hashedPassword);
        owner.setRole(Role.OWNER);
        owner.setOrganization(savedOrganization);

        User savedUser = userRepository.save(owner);

        return new RegisterResponse(
                savedOrganization.getId(),
                savedOrganization.getName(),
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                "Organization registered successfully"
        );
    }
}