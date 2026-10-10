package vn.skillbridge.platform.api;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class HealthControllerTest {
    @Test
    void preservesHealthContractAndClosesConnection() throws Exception {
        DataSource source = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        when(source.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(true);
        mvc(source).perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.service").value("genda-api"));
        verify(connection).close();
    }

    @Test
    void databaseFailureReturnsSafe503WithRequestId() throws Exception {
        DataSource source = mock(DataSource.class);
        when(source.getConnection()).thenThrow(new SQLException("private database credentials"));
        mvc(source).perform(get("/api/v1/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.requestId").isNotEmpty())
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("private database credentials"))));
    }

    @Test
    void invalidConnectionIsClosedAndNotReportedAsReady() throws Exception {
        DataSource source = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        when(source.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(false);
        mvc(source).perform(get("/api/v1/health")).andExpect(status().isServiceUnavailable());
        verify(connection).close();
    }

    private MockMvc mvc(DataSource source) {
        return MockMvcBuilders.standaloneSetup(new HealthController(source))
                .setControllerAdvice(new ApiExceptionHandler()).build();
    }
}
