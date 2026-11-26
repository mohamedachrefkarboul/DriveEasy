package com.driveeasy.location.client;

import com.driveeasy.location.dto.StatutUpdateRemoteDTO;
import com.driveeasy.location.dto.VehiculeRemoteDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Client OpenFeign pour la communication synchrone avec vehicule-service.
 */
@FeignClient(name = "vehicule-service")
public interface VehiculeServiceClient {

    @GetMapping("/vehicules")
    List<VehiculeRemoteDTO> getAllVehicules();

    @GetMapping("/vehicules/{id}")
    VehiculeRemoteDTO getVehiculeById(@PathVariable("id") Long id);

    @PatchMapping("/vehicules/{id}/statut")
    VehiculeRemoteDTO updateStatut(@PathVariable("id") Long id, @RequestBody StatutUpdateRemoteDTO request);
}
