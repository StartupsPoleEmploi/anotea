package fr.poleemploi.anotea.codec;

import fr.poleemploi.anotea.model.AuthUrl;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyReader;
import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

public class AuthUrlMessageBodyReader implements MessageBodyReader<AuthUrl> {
    public boolean isReadable(Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return type == AuthUrl.class;
    }

    public AuthUrl readFrom(Class<AuthUrl> type, Type genericType, Annotation[] annotations, MediaType mediaType, MultivaluedMap<String, String> httpHeaders, InputStream entityStream) throws IOException, WebApplicationException {
        JsonReader reader = Json.createReader(entityStream);
        JsonObject json = reader.readObject();
        return new AuthUrl(json.getString("url"));
    }
}
