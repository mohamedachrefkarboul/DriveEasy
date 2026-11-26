package com.driveeasy.location.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public class RetourRequest {

    @NotNull(message = "Le kilométrage de retour est obligatoire")
    @PositiveOrZero(message = "Le kilométrage doit être positif ou nul")
    private Double kmRetour;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateRetourEffectif;

    public RetourRequest() {
    }

    public RetourRequest(Double kmRetour, LocalDate dateRetourEffectif) {
        this.kmRetour = kmRetour;
        this.dateRetourEffectif = dateRetourEffectif;
    }

    public Double getKmRetour() {
        return kmRetour;
    }

    public void setKmRetour(Double kmRetour) {
        this.kmRetour = kmRetour;
    }

    public LocalDate getDateRetourEffectif() {
        return dateRetourEffectif;
    }

    public void setDateRetourEffectif(LocalDate dateRetourEffectif) {
        this.dateRetourEffectif = dateRetourEffectif;
    }
}
