package vn.skillbridge.applications.infrastructure.persistence;

import javax.sql.DataSource;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/** Runs after the account, catalog and contributor seeds it references. */
@Component
@Profile("demo")
@Order(40)
class DemoApplicationSeed implements ApplicationRunner {
    private final DataSource dataSource;

    DemoApplicationSeed(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        new ResourceDatabasePopulator(new ClassPathResource("db/demo/applications.sql")).execute(dataSource);
    }
}
