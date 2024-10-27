package com.presstronic.kalsumed;

import com.presstronic.kalsumed.entity.role.Role;
import com.presstronic.kalsumed.repository.role.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		if (roleRepository.findByName("ROLE_GUEST") == null) {
			roleRepository.save(new Role("ROLE_GUEST", "Guest"));
		}
		if (roleRepository.findByName("ROLE_USER") == null) {
			roleRepository.save(new Role("ROLE_USER", "User"));
		}
		if (roleRepository.findByName("ROLE_ADMIN") == null) {
			roleRepository.save(new Role("ROLE_ADMIN", "Administrator"));
		}
	}
}
