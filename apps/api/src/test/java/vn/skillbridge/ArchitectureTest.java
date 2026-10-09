package vn.skillbridge;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.stream.Collectors;

@AnalyzeClasses(packages = "vn.skillbridge", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    @ArchTest
    static final ArchRule domainHasNoFrameworkDependencies = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..", "jakarta.servlet..",
                    "..api..", "..application..", "..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage("..api..", "..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule apiDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..api..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule platformDoesNotDependOnBusinessModules = noClasses()
            .that().resideInAPackage("vn.skillbridge.platform..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "vn.skillbridge.auth..", "vn.skillbridge.projects..", "vn.skillbridge.users..",
                    "vn.skillbridge.applications..", "vn.skillbridge.matching..")
            .allowEmptyShould(true);

    /** springdoc names schemas by simple class name, so two DTOs with one name silently merge in the client. */
    @ArchTest
    static void apiDtoNamesAreUnique(JavaClasses classes) {
        Map<String, Long> names = classes.stream()
                .filter(type -> type.getPackageName().contains(".api"))
                .filter(type -> type.getSimpleName().endsWith("Response") || type.getSimpleName().endsWith("Request"))
                .collect(Collectors.groupingBy(JavaClass::getSimpleName, Collectors.counting()));
        assertThat(names).allSatisfy((name, count) -> assertThat(count).as(name).isEqualTo(1L));
    }
}
