package com.presstronic.kalsumed.entity.recipe;

import com.presstronic.kalsumed.entity.ingredient.Ingredient;
import com.presstronic.kalsumed.entity.measurement.UnitOfMeasure;
import jakarta.persistence.*;

@Entity
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitOfMeasure unitOfMeasure;

    // Constructors, getters, and setters
}

