package net.javaguides.ems.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.javaguides.ems.entity.Invitation;
import net.javaguides.ems.entity.InvitationStatus;

public interface InvitationRepository
        extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByTokenHash(String tokenHash);

    boolean existsByEmailAndOrganizationIdAndStatus(
            String email,
            Long organizationId,
            InvitationStatus status
    );
}