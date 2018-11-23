package fr.poleemploi.anotea;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import fr.poleemploi.anotea.codec.AuthUrlMessageBodyReader;
import fr.poleemploi.anotea.codec.OrganismeMessageBodyWriter;
import fr.poleemploi.anotea.model.AuthUrl;
import fr.poleemploi.anotea.model.Organisme;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import java.util.Date;

public class ApiClient {

    private final Client client;

    public ApiClient() {
        this.client = ClientBuilder.newClient()
                .register(new AuthUrlMessageBodyReader())
                .register(new OrganismeMessageBodyWriter());
    }

    private String generateJWT() {
        return JWT.create()
                .withIssuedAt(new Date())
                .withSubject("kairos")
                .sign(Algorithm.HMAC256("1234"));
    }

    public AuthUrl generateAuthUrl(Organisme organisme) {
        return client
                .target("http://localhost:8080/api/backoffice/generate-auth-url")
                .request(MediaType.APPLICATION_JSON_TYPE)
                .header("Authorization", String.format("Bearer %s", generateJWT()))
                .post(Entity.entity(organisme, MediaType.APPLICATION_JSON_TYPE), AuthUrl.class);
    }
}