package vn.skillbridge.fixtureauth.domain;

import java.sql.Connection;
import org.springframework.stereotype.Component;
import vn.skillbridge.fixtureauth.infrastructure.Adapter;

@Component
public class FrameworkLeak {
    Connection connection;
    Adapter adapter;
}
