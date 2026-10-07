package net.javaguides.ems.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.LoginRequest;
import net.javaguides.ems.dto.LoginResponse;
import net.javaguides.ems.dto.RegisterRequest;
import net.javaguides.ems.dto.RegisterResponse;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.entity.Role;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.exception.DuplicateResourceException;
import net.javaguides.ems.exception.UnauthorizedException;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.repository.UserRepository;
import net.javaguides.ems.security.JwtService;

@Service
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder, 
            JwtService jwtService) {

        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (organizationRepository.existsByEmail(request.getOrganizationEmail())) {
            throw new DuplicateResourceException(
                    "Organization email already exists"
            );
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(request.getOwnerEmail())) {
            throw new DuplicateResourceException(
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

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid email or password"
                        )
                );

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {
            throw new UnauthorizedException(
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(user);

        return new LoginResponse(token);
    }
}