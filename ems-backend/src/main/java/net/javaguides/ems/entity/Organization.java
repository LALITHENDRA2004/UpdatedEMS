package net.javaguides.ems.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Organization {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @NotBlank(message = "Organization name is required")
    @Column(nullable = false, length = 100)
    private String name; 

    @NotBlank(message = "Organization email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true, length = 150)
    private String email; 

    @JsonIgnore
    @OneToMany(
        mappedBy = "organization",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private Set<User> users = new HashSet<>();

    @OneToMany(
        mappedBy = "organization",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<Department> departments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; 

    @UpdateTimestamp  
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; 
}