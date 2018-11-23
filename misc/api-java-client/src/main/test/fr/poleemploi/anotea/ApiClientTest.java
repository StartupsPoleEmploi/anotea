package fr.poleemploi.anotea;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.ws.rs.core.Response;

class ApiClientTest {

    @Test
    void shouldFailWhenNoAuthenticated() {
        ApiClient apiClient = new ApiClient();
        Organisme organisme = new Organisme("11111111111", "Anotea Formation", "anotea.pe@gmail.com", "Grand Est");

        Response response = apiClient.generateAuthUrl(organisme);

        Assertions.assertEquals(200, response.getStatus());
    }
}