package com.driveeasy.location.dto;

public class DepartRequest {
    private Double kmDepart;

    public DepartRequest() {
    }

    public DepartRequest(Double kmDepart) {
        this.kmDepart = kmDepart;
    }

    public Double getKmDepart() {
        return kmDepart;
    }

    public void setKmDepart(Double kmDepart) {
        this.kmDepart = kmDepart;
    }
}
