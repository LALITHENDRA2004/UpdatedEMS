package net.javaguides.ems.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.service.OrganizationService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController 
@RequestMapping("/api/organizations")
public class OrganizationController {
    private OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    public Organization createOrganization(@Valid @RequestBody Organization organization) {
        return organizationService.createOrganization(organization);
    }

    @GetMapping("/{id}")
    public Organization getOrganizationById(@PathVariable  Long id) {
        return organizationService.getOrganizationById(id);
    }

    @GetMapping
    public List<Organization> getAllOrganizations() {
        return organizationService.getAllOrganizations();
    }
    
    @PutMapping("/{id}")
    public Organization updateOrganization(
            @PathVariable Long id, @Valid @RequestBody Organization organization) {
        return organizationService.updateOrganization(id, organization);
    }
}