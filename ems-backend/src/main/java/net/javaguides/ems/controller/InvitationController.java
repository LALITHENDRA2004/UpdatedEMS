package net.javaguides.ems.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import net.javaguides.ems.dto.AcceptInvitationRequest;
import net.javaguides.ems.dto.InvitationRequest;
import net.javaguides.ems.dto.InvitationResponse;
import net.javaguides.ems.service.InvitationService;

@RestController
@RequestMapping("/api/invitations")
@Validated
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(
            InvitationService invitationService) {

        this.invitationService = invitationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<InvitationResponse> createInvitation(
            @Valid @RequestBody InvitationRequest request) {

        InvitationResponse response =
                invitationService.createInvitation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/accept")
    public ResponseEntity<Void> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request) {

        invitationService.acceptInvitation(request);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}