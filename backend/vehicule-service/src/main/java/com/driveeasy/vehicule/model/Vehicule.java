package com.driveeasy.vehicule.model;

import java.math.BigDecimal;

/**
 * Entité représentant un véhicule dans le parc automobile.
 * Stocké uniquement en mémoire vive (RAM).
 */
public class Vehicule {

    private Long id;
    private String immatriculation; // Unique
    private String marque;
    private String modele;
    private int annee;
    private String couleur;
    private Carburant carburant;
    private BoiteVitesse boite;
    private int nbPlaces;
    private double kilometrage;
    private BigDecimal prixJournalier;
    private StatutVehicule statut;
    private String imageUrl;

    public Vehicule() {
    }

    public Vehicule(Long id, String immatriculation, String marque, String modele, int annee,
                    String couleur, Carburant carburant, BoiteVitesse boite, int nbPlaces,
                    double kilometrage, BigDecimal prixJournalier, StatutVehicule statut, String imageUrl) {
        this.id = id;
        this.immatriculation = immatriculation;
        this.marque = marque;
        this.modele = modele;
        this.annee = annee;
        this.couleur = couleur;
        this.carburant = carburant;
        this.boite = boite;
        this.nbPlaces = nbPlaces;
        this.kilometrage = kilometrage;
        this.prixJournalier = prixJournalier;
        this.statut = statut;
        this.imageUrl = imageUrl;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public Carburant getCarburant() {
        return carburant;
    }

    public void setCarburant(Carburant carburant) {
        this.carburant = carburant;
    }

    public BoiteVitesse getBoite() {
        return boite;
    }

    public void setBoite(BoiteVitesse boite) {
        this.boite = boite;
    }

    public int getNbPlaces() {
        return nbPlaces;
    }

    public void setNbPlaces(int nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    public double getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(double kilometrage) {
        this.kilometrage = kilometrage;
    }

    public BigDecimal getPrixJournalier() {
        return prixJournalier;
    }

    public void setPrixJournalier(BigDecimal prixJournalier) {
        this.prixJournalier = prixJournalier;
    }

    public StatutVehicule getStatut() {
        return statut;
    }

    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
