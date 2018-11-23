package fr.poleemploi.anotea;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.glassfish.jersey.client.ClientConfig;

import javax.json.stream.JsonGenerator;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Date;

public class ApiClient {

    private final Client client;

    public ApiClient() {
        ClientConfig clientConfig = new ClientConfig()
                .property(JsonGenerator.PRETTY_PRINTING, true);
        this.client = ClientBuilder.newClient();
    }

    private String generateJWT() {
        Algorithm algorithm = Algorithm.HMAC256("1234");
        return JWT.create()
                .withIssuedAt(new Date())
                .withSubject("kairos")
                .sign(algorithm);
    }

    public Response generateAuthUrl(Organisme organisme) {
        return client
                .target("http://localhost:8080/api/backoffice/generate-auth-url")
                .request(MediaType.APPLICATION_JSON_TYPE)
                .header("Authorization", String.format("Bearer %s", generateJWT()))
                .post(Entity.entity(organisme, MediaType.APPLICATION_JSON_TYPE));
    }
}