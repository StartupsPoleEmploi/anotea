package fr.poleemploi.anotea;

import fr.poleemploi.anotea.model.AuthUrl;
import fr.poleemploi.anotea.model.Organisme;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class ApiClientTest {

    @Test
    void shouldGetAuhtUrlForAnOrganisme() {
        ApiClient apiClient = new ApiClient();
        Organisme organisme = new Organisme("11111111111", "Anotea Formation", "anotea.pe@gmail.com", "Grand Est");

        AuthUrl authUrl = apiClient.generateAuthUrl(organisme);

        Assertions.assertTrue(authUrl.getUrl().contains("admin?action=loginWithAccessToken&access_token=ey"));
    }
}