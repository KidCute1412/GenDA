package vn.skillbridge;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "vn.skillbridge", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    @ArchTest
    static final ArchRule domainHasNoFrameworkDependencies = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..", "jakarta.servlet..", "..api..", "..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage("..api..", "..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule platformDoesNotDependOnBusinessModules = noClasses()
            .that().resideInAPackage("vn.skillbridge.platform..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "vn.skillbridge.projects..", "vn.skillbridge.users..")
            .allowEmptyShould(true);
}
