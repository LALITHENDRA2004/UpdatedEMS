package net.javaguides.ems.service;

import java.util.List;

import org.springframework.stereotype.Service;

import net.javaguides.ems.entity.Organization;
import net.javaguides.ems.repository.OrganizationRepository;

@Service 
public class OrganizationService {
    private OrganizationRepository organizationRepository; 

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public Organization createOrganization(Organization organization) {
        return organizationRepository.save(organization);
    }

    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id).orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }
    
    public Organization updateOrganization(Long id, Organization organization) {
        Organization existingOrganization = organizationRepository.findById(id).orElseThrow(() -> new RuntimeException("Organization not found"));
        existingOrganization.setName(organization.getName());
        existingOrganization.setEmail(organization.getEmail()); 
        return organizationRepository.save(existingOrganization);
    }
}