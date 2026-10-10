package vn.skillbridge.users.api;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.skillbridge.users.application.SkillQueryService;
import vn.skillbridge.users.application.SkillSummary;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SkillControllerTest {
    @Test
    void returnsCanonicalSkillsInCatalogOrder() throws Exception {
        SkillQueryService service = mock(SkillQueryService.class);
        when(service.listSkills()).thenReturn(List.of(
                new SkillSummary("react", "React"), new SkillSummary("typescript", "TypeScript")));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new SkillController(service)).build();

        mvc.perform(get("/api/v1/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("react"))
                .andExpect(jsonPath("$[1].name").value("TypeScript"));
    }
}
