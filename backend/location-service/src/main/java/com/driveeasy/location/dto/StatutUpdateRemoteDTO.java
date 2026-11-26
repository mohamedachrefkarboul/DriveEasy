package com.driveeasy.location.dto;

public class StatutUpdateRemoteDTO {
    private String statut;
    private Double kilometrage;

    public StatutUpdateRemoteDTO() {
    }

    public StatutUpdateRemoteDTO(String statut) {
        this.statut = statut;
    }

    public StatutUpdateRemoteDTO(String statut, Double kilometrage) {
        this.statut = statut;
        this.kilometrage = kilometrage;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Double getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Double kilometrage) {
        this.kilometrage = kilometrage;
    }
}
