package com.presstronic.kalsumed.entity.measurement;

import jakarta.persistence.*;

@Entity
public class UnitOfMeasure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String unit; // e.g., grams, ounces, cups

    public UnitOfMeasure() {}

    public UnitOfMeasure(String unit) {
        this.unit = unit;
    }

    public Long getId() {
        return id;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
