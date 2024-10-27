package com.presstronic.kalsumed;

import com.presstronic.kalsumed.entity.meal.MealType;
import com.presstronic.kalsumed.entity.measurement.UnitOfMeasure;
import com.presstronic.kalsumed.entity.role.Role;
import com.presstronic.kalsumed.repository.meal.MealTypeRepository;
import com.presstronic.kalsumed.repository.measurement.UnitOfMeasureRepository;
import com.presstronic.kalsumed.repository.role.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;

@SpringBootApplication
public class Application implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private UnitOfMeasureRepository unitOfMeasureRepository;

	@Autowired
	private MealTypeRepository mealTypeRepository;

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Set up default roles if they do not exist
		if (roleRepository.findByName("ROLE_GUEST") == null) {
			roleRepository.save(new Role("ROLE_GUEST", "Guest"));
		}
		if (roleRepository.findByName("ROLE_USER") == null) {
			roleRepository.save(new Role("ROLE_USER", "User"));
		}
		if (roleRepository.findByName("ROLE_ADMIN") == null) {
			roleRepository.save(new Role("ROLE_ADMIN", "Administrator"));
		}

		// Set up default units of measure if they do not exist
		if (unitOfMeasureRepository.count() == 0) {
			unitOfMeasureRepository.saveAll(Arrays.asList(
					new UnitOfMeasure("Teaspoon"),
					new UnitOfMeasure("Tablespoon"),
					new UnitOfMeasure("Cup"),
					new UnitOfMeasure("Milliliter"),
					new UnitOfMeasure("Liter"),
					new UnitOfMeasure("Fluid Ounce"),
					new UnitOfMeasure("Pint"),
					new UnitOfMeasure("Quart"),
					new UnitOfMeasure("Gallon"),
					new UnitOfMeasure("Gram"),
					new UnitOfMeasure("Kilogram"),
					new UnitOfMeasure("Ounce"),
					new UnitOfMeasure("Pound"),
					new UnitOfMeasure("Piece"),
					new UnitOfMeasure("Slice"),
					new UnitOfMeasure("Pinch")
			));
		}

		// Set up default meal types if they do not exist
		if (mealTypeRepository.count() == 0) {
			mealTypeRepository.saveAll(Arrays.asList(
					new MealType("Breakfast"),
					new MealType("Brunch"),
					new MealType("Lunch"),
					new MealType("Dinner"),
					new MealType("Snack"),
					new MealType("Dessert"),
					new MealType("Supper")
			));
		}
	}
}
