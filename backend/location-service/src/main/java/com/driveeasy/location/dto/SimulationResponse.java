package com.driveeasy.location.dto;

import java.math.BigDecimal;

public class SimulationResponse {

    private long nbJours;
    private BigDecimal prixJournalier;
    private BigDecimal montantBase;
    private String categorieClient;
    private BigDecimal remisePourcentage; // e.g. 0.05
    private BigDecimal montantRemise;
    private BigDecimal montantTotal;

    public SimulationResponse() {
    }

    public long getNbJours() {
        return nbJours;
    }

    public void setNbJours(long nbJours) {
        this.nbJours = nbJours;
    }

    public BigDecimal getPrixJournalier() {
        return prixJournalier;
    }

    public void setPrixJournalier(BigDecimal prixJournalier) {
        this.prixJournalier = prixJournalier;
    }

    public BigDecimal getMontantBase() {
        return montantBase;
    }

    public void setMontantBase(BigDecimal montantBase) {
        this.montantBase = montantBase;
    }

    public String getCategorieClient() {
        return categorieClient;
    }

    public void setCategorieClient(String categorieClient) {
        this.categorieClient = categorieClient;
    }

    public BigDecimal getRemisePourcentage() {
        return remisePourcentage;
    }

    public void setRemisePourcentage(BigDecimal remisePourcentage) {
        this.remisePourcentage = remisePourcentage;
    }

    public BigDecimal getMontantRemise() {
        return montantRemise;
    }

    public void setMontantRemise(BigDecimal montantRemise) {
        this.montantRemise = montantRemise;
    }

    public BigDecimal getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(BigDecimal montantTotal) {
        this.montantTotal = montantTotal;
    }
}
