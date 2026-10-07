package net.javaguides.ems.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.ems.dto.AcceptInvitationRequest;
import net.javaguides.ems.dto.InvitationRequest;
import net.javaguides.ems.dto.InvitationResponse;
import net.javaguides.ems.entity.Invitation;
import net.javaguides.ems.entity.InvitationStatus;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.entity.Role;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.repository.InvitationRepository;
import net.javaguides.ems.repository.OrganizationRepository;
import net.javaguides.ems.repository.UserRepository;
import net.javaguides.ems.security.TenantSecurityService;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantSecurityService tenantSecurityService;

    private final SecureRandom secureRandom = new SecureRandom();

    public InvitationService(
            InvitationRepository invitationRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TenantSecurityService tenantSecurityService) {

        this.invitationRepository = invitationRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Transactional
    public InvitationResponse createInvitation(
            InvitationRequest request) {

        Long organizationId =
                tenantSecurityService.getCurrentOrganizationId();

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        Role role = request.getRole();

        validateRoleCanBeInvited(role);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "A user with this email already exists"
            );
        }

        if (invitationRepository
                .existsByEmailAndOrganizationIdAndStatus(
                        email,
                        organizationId,
                        InvitationStatus.PENDING)) {

            throw new IllegalArgumentException(
                    "A pending invitation already exists for this email"
            );
        }

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Organization not found"
                                ));

        String rawToken = generateToken();
        String tokenHash = hashToken(rawToken);

        Invitation invitation = new Invitation();

        invitation.setEmail(email);
        invitation.setRole(role);
        invitation.setTokenHash(tokenHash);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setExpiresAt(
                LocalDateTime.now().plusHours(24)
        );
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setOrganization(organization);

        Invitation savedInvitation =
                invitationRepository.save(invitation);

        return new InvitationResponse(
                savedInvitation.getId(),
                savedInvitation.getEmail(),
                savedInvitation.getRole(),
                rawToken,
                savedInvitation.getExpiresAt(),
                "Invitation created successfully"
        );
    }

    @Transactional
    public void acceptInvitation(
            AcceptInvitationRequest request) {

        String tokenHash = hashToken(request.getToken());

        Invitation invitation =
                invitationRepository.findByTokenHash(tokenHash)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid invitation token"
                                ));

        if (invitation.getStatus()
                != InvitationStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Invitation is no longer valid"
            );
        }

        if (invitation.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            invitation.setStatus(
                    InvitationStatus.EXPIRED
            );

            invitationRepository.save(invitation);

            throw new IllegalArgumentException(
                    "Invitation has expired"
            );
        }

        String username =
                request.getUsername().trim();

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                invitation.getEmail())) {

            throw new IllegalArgumentException(
                    "A user with this email already exists"
            );
        }

        User user = new User();

        user.setUsername(username);
        user.setEmail(invitation.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(invitation.getRole());
        user.setOrganization(
                invitation.getOrganization()
        );

        userRepository.save(user);

        invitation.setStatus(
                InvitationStatus.ACCEPTED
        );

        invitation.setAcceptedAt(
                LocalDateTime.now()
        );

        invitationRepository.save(invitation);
    }

    private void validateRoleCanBeInvited(Role role) {

        if (role == Role.OWNER) {
            throw new IllegalArgumentException(
                    "OWNER cannot be assigned through invitation"
            );
        }

        String currentRole =
                tenantSecurityService
                        .getCurrentUser()
                        .role();

        Role currentUserRole =
                Role.valueOf(currentRole);

        if (currentUserRole == Role.ADMIN &&
                role == Role.ADMIN) {

            throw new IllegalArgumentException(
                    "ADMIN cannot invite another ADMIN"
            );
        }
    }

    private String generateToken() {

        byte[] bytes = new byte[32];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder result = new StringBuilder();

            for (byte b : hash) {
                result.append(
                        String.format("%02x", b)
                );
            }

            return result.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}