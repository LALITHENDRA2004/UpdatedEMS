package net.javaguides.ems.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotNull;
import net.javaguides.ems.dto.UserResponse;
import net.javaguides.ems.entity.Role;
import net.javaguides.ems.service.UserService;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize(
            "hasAnyRole(" +
            "'OWNER', 'ADMIN', 'HR'" +
            ")"
    )
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @PutMapping("/{id}/role")
    @PreAuthorize(
            "hasAnyRole('OWNER', 'ADMIN')"
    )
    public ResponseEntity<Void> updateRole(
            @PathVariable Long id,
            @RequestParam @NotNull Role role) {

        userService.updateRole(id, role);

        return ResponseEntity.noContent().build();
    }
}