package com.driveeasy.location.dto;

public class LocationDetailDTO {

    private LocationDTO location;
    private ClientRemoteDTO client;
    private VehiculeRemoteDTO vehicule;

    public LocationDetailDTO() {
    }

    public LocationDetailDTO(LocationDTO location, ClientRemoteDTO client, VehiculeRemoteDTO vehicule) {
        this.location = location;
        this.client = client;
        this.vehicule = vehicule;
    }

    public LocationDTO getLocation() {
        return location;
    }

    public void setLocation(LocationDTO location) {
        this.location = location;
    }

    public ClientRemoteDTO getClient() {
        return client;
    }

    public void setClient(ClientRemoteDTO client) {
        this.client = client;
    }

    public VehiculeRemoteDTO getVehicule() {
        return vehicule;
    }

    public void setVehicule(VehiculeRemoteDTO vehicule) {
        this.vehicule = vehicule;
    }
}
