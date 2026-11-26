package com.driveeasy.location.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class StatistiquesDTO {

    private BigDecimal chiffreAffairesTotal;
    private long nombreLocationsTotal;
    private long nombreLocationsEnCours;
    private long nombreLocationsTerminees;
    private double tauxOccupation; // percentage e.g. 45.0%
    private List<Map<String, Object>> topVehicules;

    public StatistiquesDTO() {
    }

    public BigDecimal getChiffreAffairesTotal() {
        return chiffreAffairesTotal;
    }

    public void setChiffreAffairesTotal(BigDecimal chiffreAffairesTotal) {
        this.chiffreAffairesTotal = chiffreAffairesTotal;
    }

    public long getNombreLocationsTotal() {
        return nombreLocationsTotal;
    }

    public void setNombreLocationsTotal(long nombreLocationsTotal) {
        this.nombreLocationsTotal = nombreLocationsTotal;
    }

    public long getNombreLocationsEnCours() {
        return nombreLocationsEnCours;
    }

    public void setNombreLocationsEnCours(long nombreLocationsEnCours) {
        this.nombreLocationsEnCours = nombreLocationsEnCours;
    }

    public long getNombreLocationsTerminees() {
        return nombreLocationsTerminees;
    }

    public void setNombreLocationsTerminees(long nombreLocationsTerminees) {
        this.nombreLocationsTerminees = nombreLocationsTerminees;
    }

    public double getTauxOccupation() {
        return tauxOccupation;
    }

    public void setTauxOccupation(double tauxOccupation) {
        this.tauxOccupation = tauxOccupation;
    }

    public List<Map<String, Object>> getTopVehicules() {
        return topVehicules;
    }

    public void setTopVehicules(List<Map<String, Object>> topVehicules) {
        this.topVehicules = topVehicules;
    }
}
