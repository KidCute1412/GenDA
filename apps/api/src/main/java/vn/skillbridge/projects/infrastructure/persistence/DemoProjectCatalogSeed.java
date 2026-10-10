package vn.skillbridge.projects.infrastructure.persistence;

import javax.sql.DataSource;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
class DemoProjectCatalogSeed implements ApplicationRunner {
    private final DataSource dataSource;

    DemoProjectCatalogSeed(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        new ResourceDatabasePopulator(new ClassPathResource("db/demo/catalog.sql")).execute(dataSource);
    }
}
