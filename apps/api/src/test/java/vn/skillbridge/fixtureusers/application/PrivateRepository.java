package vn.skillbridge.fixtureusers.application;

import vn.skillbridge.fixtureauth.application.RepositoryLeak;

public interface PrivateRepository {
    RepositoryLeak find();
}
