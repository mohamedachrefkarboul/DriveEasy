package com.driveeasy.client.model;

import java.time.LocalDate;

/**
 * Entité représentant un client de la plateforme.
 * Stocké en mémoire vive (RAM) - Pas de BDD externe.
 */
public class Client {

    private Long id;
    private String cin; // Unique
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String email; // Unique
    private String telephone;
    private String adresse;
    private String numeroPermis; // Unique
    private LocalDate dateExpirationPermis;
    private CategorieClient categorieClient;
    private LocalDate dateInscription;

    public Client() {
    }

    public Client(Long id, String cin, String nom, String prenom, LocalDate dateNaissance,
                  String email, String telephone, String adresse, String numeroPermis,
                  LocalDate dateExpirationPermis, CategorieClient categorieClient, LocalDate dateInscription) {
        this.id = id;
        this.cin = cin;
        this.nom = nom;
        this.prenom = prenom;
        this.dateNaissance = dateNaissance;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
        this.numeroPermis = numeroPermis;
        this.dateExpirationPermis = dateExpirationPermis;
        this.categorieClient = categorieClient;
        this.dateInscription = dateInscription;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getNumeroPermis() {
        return numeroPermis;
    }

    public void setNumeroPermis(String numeroPermis) {
        this.numeroPermis = numeroPermis;
    }

    public LocalDate getDateExpirationPermis() {
        return dateExpirationPermis;
    }

    public void setDateExpirationPermis(LocalDate dateExpirationPermis) {
        this.dateExpirationPermis = dateExpirationPermis;
    }

    public CategorieClient getCategorieClient() {
        return categorieClient;
    }

    public void setCategorieClient(CategorieClient categorieClient) {
        this.categorieClient = categorieClient;
    }

    public LocalDate getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDate dateInscription) {
        this.dateInscription = dateInscription;
    }
}
