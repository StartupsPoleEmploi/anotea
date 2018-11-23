package fr.poleemploi.anotea;

public class Organisme {


    private String siret;
    private String raisonSociale;
    private String courriel;
    private String region;

    private Organisme() {
        //for json mapper tool
    }

    public Organisme(String siret, String raisonSociale, String courriel, String region) {
        this.siret = siret;
        this.raisonSociale = raisonSociale;
        this.courriel = courriel;
        this.region = region;
    }

    public String getSiret() {
        return siret;
    }

    public String getRaisonSociale() {
        return raisonSociale;
    }

    public String getCourriel() {
        return courriel;
    }

    public String getRegion() {
        return region;
    }
}
