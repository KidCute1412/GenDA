package vn.skillbridge;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;
import vn.skillbridge.fixtureauth.api.InfrastructureLeak;
import vn.skillbridge.fixtureauth.application.RepositoryLeak;
import vn.skillbridge.fixtureauth.domain.FrameworkLeak;
import vn.skillbridge.fixtureauth.infrastructure.Adapter;
import vn.skillbridge.fixtureusers.application.PrivateRepository;
import static org.assertj.core.api.Assertions.assertThat;

class ArchitectureRulesTest {
    @Test
    void rejectsFrameworkInfrastructureAndJdbcDependenciesFromDomain() {
        var classes = new ClassFileImporter().importClasses(FrameworkLeak.class);
        var result = ArchitectureTest.domainHasNoFrameworkDependencies.evaluate(classes);
        assertThat(result.hasViolation()).isTrue();
        assertThat(result.getFailureReport().toString()).contains(
                "org.springframework.stereotype.Component", "java.sql.Connection", Adapter.class.getName());
    }

    @Test
    void rejectsAnotherModulesPrivateRepository() {
        var classes = new ClassFileImporter().importClasses(RepositoryLeak.class, PrivateRepository.class);
        var result = ArchitectureTest.crossModuleDependenciesArePublished.evaluate(classes);
        assertThat(result.hasViolation()).isTrue();
        assertThat(result.getFailureReport().toString()).contains(PrivateRepository.class.getName());
    }

    @Test
    void rejectsInfrastructureAccessFromApi() {
        var classes = new ClassFileImporter().importClasses(InfrastructureLeak.class, Adapter.class);
        var result = ArchitectureTest.apiDoesNotDependOnInfrastructure.evaluate(classes);
        assertThat(result.hasViolation()).isTrue();
        assertThat(result.getFailureReport().toString()).contains(Adapter.class.getName());
    }

    @Test
    void rejectsCyclesBetweenModules() {
        var classes = new ClassFileImporter().importClasses(RepositoryLeak.class, PrivateRepository.class);
        var result = ArchitectureTest.modulesHaveNoCycles.evaluate(classes);
        assertThat(result.hasViolation()).isTrue();
        assertThat(result.getFailureReport().toString()).contains("Cycle detected");
    }
}
