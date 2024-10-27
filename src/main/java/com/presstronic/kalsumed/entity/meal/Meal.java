package com.presstronic.kalsumed.entity.meal;

import com.presstronic.kalsumed.entity.user.ApplicationUser;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime mealTime;

    @ManyToOne
    @JoinColumn(name = "meal_type_id", nullable = false)
    private MealType mealType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private ApplicationUser user;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealRecipe> mealRecipes = new ArrayList<>();

    // Constructors, Getters, and Setters
    public Meal() {}

    // Getters and Setters for all fields
    public Long getId() {
        return id;
    }

    public LocalDateTime getMealTime() {
        return mealTime;
    }

    public void setMealTime(LocalDateTime mealTime) {
        this.mealTime = mealTime;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public ApplicationUser getUser() {
        return user;
    }

    public void setUser(ApplicationUser user) {
        this.user = user;
    }

    public List<MealRecipe> getMealRecipes() {
        return mealRecipes;
    }

    public void setMealRecipes(List<MealRecipe> mealRecipes) {
        this.mealRecipes = mealRecipes;
    }

    // @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Meal meal = (Meal) o;

        if (!id.equals(meal.id)) return false;
        if (!mealTime.equals(meal.mealTime)) return false;
        if (!mealType.equals(meal.mealType)) return false;
        if (!user.equals(meal.user)) return false;
        return mealRecipes.equals(meal.mealRecipes);
    }

    @Override
    public int hashCode() {
        int result = id.hashCode();
        result = 31 * result + mealTime.hashCode();
        result = 31 * result + mealType.hashCode();
        result = 31 * result + user.hashCode();
        result = 31 * result + mealRecipes.hashCode();
        return result;
    }
}
