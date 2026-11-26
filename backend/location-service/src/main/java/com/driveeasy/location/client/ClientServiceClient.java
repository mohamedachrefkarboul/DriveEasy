package com.driveeasy.location.client;

import com.driveeasy.location.dto.CategorieUpdateRemoteDTO;
import com.driveeasy.location.dto.ClientRemoteDTO;
import com.driveeasy.location.dto.EligibiliteRemoteDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Client OpenFeign pour la communication synchrone avec client-service.
 */
@FeignClient(name = "client-service")
public interface ClientServiceClient {

    @GetMapping("/clients/{id}")
    ClientRemoteDTO getClientById(@PathVariable("id") Long id);

    @GetMapping("/clients/{id}/eligibilite")
    EligibiliteRemoteDTO checkEligibilite(@PathVariable("id") Long id);

    @PatchMapping("/clients/{id}/categorie")
    ClientRemoteDTO updateCategorie(@PathVariable("id") Long id, @RequestBody CategorieUpdateRemoteDTO request);
}
