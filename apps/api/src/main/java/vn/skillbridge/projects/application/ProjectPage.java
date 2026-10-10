package vn.skillbridge.projects.application;

import java.util.List;

public record ProjectPage<T>(List<T> data, int page, int pageSize, long total) {
    public ProjectPage {
        data = List.copyOf(data);
    }
}
