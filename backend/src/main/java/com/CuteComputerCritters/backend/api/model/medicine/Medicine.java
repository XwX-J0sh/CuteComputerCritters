package com.CuteComputerCritters.backend.api.model.medicine;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="MEDICINE")
public class Medicine {
    @Column(name = "MEDICINE_ID")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int medicineId;

    @JsonProperty("medicineType")
    @Enumerated(EnumType.STRING)
    @Column(name = "MEDICINE_TYPE")
    private EnumMedicineType medicineType;

    public Medicine() {
    }

    public Medicine(EnumMedicineType medicineType) {
        this.medicineType = medicineType;
    }
}
