package com.driveeasy.client.dto;

import com.driveeasy.client.model.CategorieClient;
import jakarta.validation.constraints.NotNull;

public class CategorieUpdateRequest {

    @NotNull(message = "La catégorie est obligatoire")
    private CategorieClient categorieClient;

    public CategorieUpdateRequest() {
    }

    public CategorieUpdateRequest(CategorieClient categorieClient) {
        this.categorieClient = categorieClient;
    }

    public CategorieClient getCategorieClient() {
        return categorieClient;
    }

    public void setCategorieClient(CategorieClient categorieClient) {
        this.categorieClient = categorieClient;
    }
}
