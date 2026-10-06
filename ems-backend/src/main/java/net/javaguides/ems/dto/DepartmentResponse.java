package net.javaguides.ems.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;

    private String name;

    private Long organizationId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}