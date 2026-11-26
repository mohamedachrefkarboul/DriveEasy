package com.driveeasy.vehicule.dto;

import com.driveeasy.vehicule.model.StatutVehicule;
import jakarta.validation.constraints.NotNull;

public class StatutUpdateRequest {

    @NotNull(message = "Le statut est obligatoire")
    private StatutVehicule statut;

    private Double kilometrage;

    public StatutUpdateRequest() {
    }

    public StatutUpdateRequest(StatutVehicule statut) {
        this.statut = statut;
    }

    public StatutVehicule getStatut() {
        return statut;
    }

    public void setStatut(StatutVehicule statut) {
        this.statut = statut;
    }

    public Double getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Double kilometrage) {
        this.kilometrage = kilometrage;
    }
}
