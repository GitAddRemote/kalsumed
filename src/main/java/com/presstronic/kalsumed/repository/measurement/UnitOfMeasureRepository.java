package com.presstronic.kalsumed.repository.measurement;

import com.presstronic.kalsumed.entity.measurement.UnitOfMeasure;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, Long> {
    UnitOfMeasure findByUnit(String unit);
}
