package com.driveeasy.location.dto;

public class CategorieUpdateRemoteDTO {
    private String categorieClient;

    public CategorieUpdateRemoteDTO() {
    }

    public CategorieUpdateRemoteDTO(String categorieClient) {
        this.categorieClient = categorieClient;
    }

    public String getCategorieClient() {
        return categorieClient;
    }

    public void setCategorieClient(String categorieClient) {
        this.categorieClient = categorieClient;
    }
}
