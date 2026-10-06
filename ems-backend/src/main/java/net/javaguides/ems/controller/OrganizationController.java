package net.javaguides.ems.controller;

import net.javaguides.ems.security.TenantSecurityService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.service.OrganizationService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController 
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;
    private final TenantSecurityService tenantSecurityService;

    public OrganizationController(
        OrganizationService organizationService, 
    TenantSecurityService tenantSecurityService) {
        this.organizationService = organizationService;
        this.tenantSecurityService = tenantSecurityService;
    }

    
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(
            organizationService.getAllOrganizations()
        );
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN') " + "and @tenantSecurity.canAccessOrganization(#id)")
    public ResponseEntity<Organization> updateOrganization(
        @PathVariable Long id, @Valid @RequestBody Organization organization) {
            return ResponseEntity.ok(
                organizationService.updateOrganization(
                    id, 
                    organization
                )
            );
        }
        
    @DeleteMapping("/{id}")
    @PreAuthorize(
        "hasRole('OWNER') " +
        "and @tenantSecurity.canAccessOrganization(#id)"
    )
    public ResponseEntity<Void> deleteOrganization(
        @PathVariable Long id) {
            organizationService.deleteOrganization(id); 
            return ResponseEntity.noContent().build();
        }
        
        @GetMapping("/me")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<Organization> getMyOrganization() {
            
            return ResponseEntity.ok(
                organizationService.getOrganizationById(
                    tenantSecurityService.getCurrentOrganizationId()
                )
            );
        }

        @GetMapping("/{id}")
        @PreAuthorize("@tenantSecurity.canAccessOrganization(#id)")
        public ResponseEntity<Organization> getOrganizationById(@PathVariable  Long id) {
            return ResponseEntity.ok(
                organizationService.getOrganizationById(id)
            );
        }
}