package com.driveeasy.location.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité Location représentant le cycle de vie d'une location.
 * Stocké en mémoire vive (RAM) - Pas de base de données externe.
 */
public class Location {

    private Long id;
    private Long clientId;
    private Long vehiculeId;
    private LocalDate dateDebut;
    private LocalDate dateFinPrevue;
    private LocalDate dateRetourEffectif;
    private Double kmDepart;
    private Double kmRetour;
    private BigDecimal prixJournalierApplique;
    private BigDecimal montantTotal;
    private BigDecimal penalite;
    private StatutLocation statut;
    private LocalDateTime dateCreation;

    public Location() {
    }

    public Location(Long id, Long clientId, Long vehiculeId, LocalDate dateDebut, LocalDate dateFinPrevue,
                    LocalDate dateRetourEffectif, Double kmDepart, Double kmRetour,
                    BigDecimal prixJournalierApplique, BigDecimal montantTotal, BigDecimal penalite,
                    StatutLocation statut, LocalDateTime dateCreation) {
        this.id = id;
        this.clientId = clientId;
        this.vehiculeId = vehiculeId;
        this.dateDebut = dateDebut;
        this.dateFinPrevue = dateFinPrevue;
        this.dateRetourEffectif = dateRetourEffectif;
        this.kmDepart = kmDepart;
        this.kmRetour = kmRetour;
        this.prixJournalierApplique = prixJournalierApplique;
        this.montantTotal = montantTotal;
        this.penalite = penalite;
        this.statut = statut;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFinPrevue() {
        return dateFinPrevue;
    }

    public void setDateFinPrevue(LocalDate dateFinPrevue) {
        this.dateFinPrevue = dateFinPrevue;
    }

    public LocalDate getDateRetourEffectif() {
        return dateRetourEffectif;
    }

    public void setDateRetourEffectif(LocalDate dateRetourEffectif) {
        this.dateRetourEffectif = dateRetourEffectif;
    }

    public Double getKmDepart() {
        return kmDepart;
    }

    public void setKmDepart(Double kmDepart) {
        this.kmDepart = kmDepart;
    }

    public Double getKmRetour() {
        return kmRetour;
    }

    public void setKmRetour(Double kmRetour) {
        this.kmRetour = kmRetour;
    }

    public BigDecimal getPrixJournalierApplique() {
        return prixJournalierApplique;
    }

    public void setPrixJournalierApplique(BigDecimal prixJournalierApplique) {
        this.prixJournalierApplique = prixJournalierApplique;
    }

    public BigDecimal getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(BigDecimal montantTotal) {
        this.montantTotal = montantTotal;
    }

    public BigDecimal getPenalite() {
        return penalite;
    }

    public void setPenalite(BigDecimal penalite) {
        this.penalite = penalite;
    }

    public StatutLocation getStatut() {
        return statut;
    }

    public void setStatut(StatutLocation statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
