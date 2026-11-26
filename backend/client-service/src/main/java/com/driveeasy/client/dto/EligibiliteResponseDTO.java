package com.driveeasy.client.dto;

public class EligibiliteResponseDTO {

    private boolean eligible;
    private String motif;
    private int age;
    private boolean permisValide;

    public EligibiliteResponseDTO() {
    }

    public EligibiliteResponseDTO(boolean eligible, String motif, int age, boolean permisValide) {
        this.eligible = eligible;
        this.motif = motif;
        this.age = age;
        this.permisValide = permisValide;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public boolean isPermisValide() {
        return permisValide;
    }

    public void setPermisValide(boolean permisValide) {
        this.permisValide = permisValide;
    }
}
