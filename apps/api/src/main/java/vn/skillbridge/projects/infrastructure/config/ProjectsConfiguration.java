package vn.skillbridge.projects.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.skillbridge.projects.domain.ProjectBudgetPolicy;

@Configuration
class ProjectsConfiguration {
    @Bean
    ProjectBudgetPolicy projectBudgetPolicy() {
        return ProjectBudgetPolicy.standard();
    }
}
