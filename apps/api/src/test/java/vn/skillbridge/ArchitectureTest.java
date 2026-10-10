package vn.skillbridge;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.assertj.core.api.Assertions.assertThat;

@AnalyzeClasses(packages = "vn.skillbridge", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    // Publish only the types documented in docs/architecture.md, never whole application packages.
    private static final Map<String, Set<String>> PUBLIC_DEPENDENCIES = Map.of(
            "users.application", Set.of(
                    "vn.skillbridge.auth.application.account.AccountProfileService",
                    "vn.skillbridge.auth.application.account.AccountProfile",
                    "vn.skillbridge.auth.application.account.AccountStanding"),
            "projects.application", Set.of(
                    "vn.skillbridge.users.application.SkillQueryService",
                    "vn.skillbridge.users.application.SkillSummary",
                    "vn.skillbridge.auth.application.account.AccountProfileService",
                    "vn.skillbridge.auth.application.account.AccountProfile"),
            "projects.api", Set.of("vn.skillbridge.users.application.SkillSummary"),
            "applications.application", Set.of(
                    "vn.skillbridge.auth.application.account.AccountProfileService",
                    "vn.skillbridge.auth.application.account.AccountProfile",
                    "vn.skillbridge.users.application.SkillQueryService",
                    "vn.skillbridge.users.application.SkillSummary",
                    "vn.skillbridge.users.application.CvFile",
                    "vn.skillbridge.users.application.eligibility.ContributorEligibilityService",
                    "vn.skillbridge.users.application.eligibility.ApplicantProfile",
                    "vn.skillbridge.users.application.eligibility.ApplicationEligibility",
                    "vn.skillbridge.projects.application.staffing.ProjectStaffingService",
                    "vn.skillbridge.projects.application.staffing.StaffingProject",
                    "vn.skillbridge.matching.domain.SkillMatch"),
            "applications.api", Set.of(
                    "vn.skillbridge.users.application.SkillSummary",
                    "vn.skillbridge.users.application.CvFile",
                    "vn.skillbridge.users.application.eligibility.ApplicantProfile",
                    "vn.skillbridge.users.application.eligibility.ApplicantProfile$Cv",
                    "vn.skillbridge.users.application.eligibility.ApplicantProfile$Education",
                    "vn.skillbridge.projects.application.staffing.StaffingProject",
                    "vn.skillbridge.matching.domain.SkillMatch"),
            "admin.api", Set.of(
                    "vn.skillbridge.projects.application.moderation.ProjectModerationService",
                    "vn.skillbridge.projects.api.dto.ManagedProjectResponse",
                    "vn.skillbridge.projects.domain.ProjectComplexity"),
            "*.api", Set.of(
                    "vn.skillbridge.platform.api.dto.ApiError",
                    "vn.skillbridge.auth.application.session.AuthenticatedPrincipal"));

    private static final DescribedPredicate<JavaClass> BUSINESS_CLASSES = new DescribedPredicate<>(
            "belong to a business module") {
        @Override
        public boolean test(JavaClass type) {
            return type.getPackageName().startsWith("vn.skillbridge.") && !module(type).equals("platform");
        }
    };

    @ArchTest
    static final ArchRule domainHasNoFrameworkDependencies = classes()
            .that().resideInAPackage("..domain..")
            .should().onlyDependOnClassesThat(JavaClass.Predicates
                    .resideInAnyPackage("java..", "vn.skillbridge.*.domain..")
                    .and(DescribedPredicate.not(JavaClass.Predicates.resideInAPackage("java.sql.."))));

    @ArchTest
    static final ArchRule applicationDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..api..", "..infrastructure..", "jakarta..", "org.hibernate..", "org.springframework.data..",
                    "org.springframework.web..", "org.springframework.http..", "org.springframework.security..",
                    "java.sql..", "javax.sql..");

    @ArchTest
    static final ArchRule applicationUsesOnlyApprovedSpringAnnotations = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat(new DescribedPredicate<>("are Spring internals, not approved annotations") {
                @Override
                public boolean test(JavaClass type) {
                    String packageName = type.getPackageName();
                    return packageName.startsWith("org.springframework.")
                            && !packageName.equals("org.springframework.stereotype")
                            && !packageName.equals("org.springframework.transaction.annotation");
                }
            });

    @ArchTest
    static final ArchRule apiDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..api..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

    @ArchTest
    static final ArchRule infrastructureDoesNotDependOnApi = noClasses()
            .that().resideInAPackage("..infrastructure..")
            .should().dependOnClassesThat().resideInAPackage("..api..");

    @ArchTest
    static final ArchRule platformDoesNotDependOnBusinessModules = noClasses()
            .that().resideInAPackage("vn.skillbridge.platform..")
            .should().dependOnClassesThat(BUSINESS_CLASSES);

    @ArchTest
    static final ArchRule businessClassesHaveALayer = classes().that(BUSINESS_CLASSES)
            .should().resideInAnyPackage(
                    "vn.skillbridge.*.api..", "vn.skillbridge.*.application..",
                    "vn.skillbridge.*.domain..", "vn.skillbridge.*.infrastructure..");

    @ArchTest
    static final ArchRule onlyTheCompositionRootLivesInTheRootPackage = classes()
            .that().resideInAPackage("vn.skillbridge")
            .should().haveFullyQualifiedName("vn.skillbridge.SkillBridgeApplication");

    @ArchTest
    static final ArchRule modulesHaveNoCycles = slices().matching("vn.skillbridge.(*)..")
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule crossModuleDependenciesArePublished = classes().that(BUSINESS_CLASSES)
            .should(new ArchCondition<>("use only published cross-module interfaces") {
                @Override
                public void check(JavaClass origin, ConditionEvents events) {
                    String[] parts = origin.getPackageName().split("\\.");
                    String layer = parts.length > 3 ? parts[3] : "";
                    String caller = parts[2] + "." + layer;
                    for (var dependency : origin.getDirectDependenciesFromSelf()) {
                        JavaClass target = dependency.getTargetClass();
                        if (!target.getPackageName().startsWith("vn.skillbridge.")
                                || module(origin).equals(module(target))) continue;
                        boolean published = PUBLIC_DEPENDENCIES.getOrDefault(caller, Set.of())
                                .contains(target.getName())
                                || PUBLIC_DEPENDENCIES.getOrDefault("*." + layer, Set.of())
                                    .contains(target.getName());
                        events.add(new SimpleConditionEvent(dependency, published, dependency.getDescription()));
                    }
                }
            });

    /** springdoc names schemas by simple class name, so two DTOs with one name silently merge in the client. */
    @ArchTest
    static void apiDtoNamesAreUnique(JavaClasses classes) {
        Map<String, Long> names = classes.stream()
                .filter(type -> type.getPackageName().contains(".api"))
                .filter(type -> type.getSimpleName().endsWith("Response") || type.getSimpleName().endsWith("Request"))
                .collect(Collectors.groupingBy(JavaClass::getSimpleName, Collectors.counting()));
        assertThat(names).allSatisfy((name, count) -> assertThat(count).as(name).isEqualTo(1L));
    }

    private static String module(JavaClass type) {
        return type.getPackageName().split("\\.")[2];
    }
}
