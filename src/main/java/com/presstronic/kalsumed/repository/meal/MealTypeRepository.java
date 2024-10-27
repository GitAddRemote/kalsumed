package com.presstronic.kalsumed.repository.meal;

import com.presstronic.kalsumed.entity.meal.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealTypeRepository extends JpaRepository<MealType, Long> {
    MealType findByName(String name);
}

