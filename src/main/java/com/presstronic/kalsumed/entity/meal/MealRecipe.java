package com.presstronic.kalsumed.entity.meal;

import com.presstronic.kalsumed.entity.recipe.Recipe;
import jakarta.persistence.*;

@Entity
public class MealRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double servings;

    @ManyToOne
    @JoinColumn(name = "meal_id")
    private Meal meal;

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    public MealRecipe() {}

    public MealRecipe(Double servings, Meal meal, Recipe recipe) {
        this.servings = servings;
        this.meal = meal;
        this.recipe = recipe;
    }

    public Long getId() {
        return id;
    }

    public Double getServings() {
        return servings;
    }

    public void setServings(Double servings) {
        this.servings = servings;
    }

    public Meal getMeal() {
        return meal;
    }

    public void setMeal(Meal meal) {
        this.meal = meal;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }
}

