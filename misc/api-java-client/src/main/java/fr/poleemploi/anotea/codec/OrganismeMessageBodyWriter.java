package fr.poleemploi.anotea.codec;

import fr.poleemploi.anotea.model.Organisme;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.Writer;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

public class OrganismeMessageBodyWriter implements MessageBodyWriter<Organisme> {

    public boolean isWriteable(Class type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return type == Organisme.class;
    }

    public long getSize(Organisme organisme, Class type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return 0;
    }

    public void writeTo(Organisme organisme, Class type, Type genericType, Annotation[] annotations, MediaType mediaType, MultivaluedMap httpHeaders, OutputStream entityStream) throws IOException, WebApplicationException {

        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("siret", organisme.getSiret());
        builder.add("raison_sociale", organisme.getRaisonSociale());
        builder.add("courriel", organisme.getCourriel());
        builder.add("region", organisme.getRegion());
        JsonObject json = builder.build();

        Writer writer = new PrintWriter(entityStream);
        writer.write(json.toString());
        writer.flush();
        writer.close();
    }
}
