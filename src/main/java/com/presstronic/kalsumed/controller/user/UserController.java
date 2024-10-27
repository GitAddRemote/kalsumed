package com.presstronic.kalsumed.controller.user;

import com.presstronic.kalsumed.entity.role.Role;
import com.presstronic.kalsumed.entity.user.ApplicationUser;
import com.presstronic.kalsumed.service.role.RoleService;
import com.presstronic.kalsumed.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @GetMapping
    public List<ApplicationUser> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationUser> getUserById(@PathVariable Long id) {
        Optional<ApplicationUser> user = userService.getUserById(id);

        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApplicationUser> createUser(@RequestBody ApplicationUser applicationUser) {

        if (applicationUser.getRoles().isEmpty()) {
            Role defaultRole = roleService.findDefaultRole()
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            applicationUser.getRoles().add(defaultRole);
        }
        ApplicationUser createdUser = userService.createUser(applicationUser);

        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationUser> putUser(@PathVariable Long id, @RequestBody ApplicationUser applicationUserDetails) {
        Optional<ApplicationUser> updatedUser = userService.updateUser(id, applicationUserDetails);

        // FIXME: If updatedUser is empty we should create a new user with the details in applicationUserDetails
        return updatedUser.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApplicationUser> patchApplicationUser(@PathVariable Long id, @RequestBody ApplicationUser userUpdates) {
        Optional<ApplicationUser> existingUserOptional = userService.getUserById(id);

        if (existingUserOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        ApplicationUser existingUser = existingUserOptional.get();

        // FIXME: Abstract this out to a generic method we can add to controllers that will maybe use reflection to apply updates
        // Apply updates
        if (userUpdates.getEmail() != null) {
            existingUser.setEmail(userUpdates.getEmail());
        }
        if (userUpdates.getFirstName() != null) {
            existingUser.setFirstName(userUpdates.getFirstName());
        }
        if (userUpdates.getLastName() != null) {
            existingUser.setLastName(userUpdates.getLastName());
        }
        if (userUpdates.getPassword() != null) {
            existingUser.setPassword(userUpdates.getPassword());
        }
        if (userUpdates.getOauth2Provider() != null) {
            existingUser.setOauth2Provider(userUpdates.getOauth2Provider());
        }
        if (userUpdates.getOauth2Id() != null) {
            existingUser.setOauth2Id(userUpdates.getOauth2Id());
        }

        // Save the updated user back to the database
        userService.updateUser(existingUser.getId(), existingUser);

        return ResponseEntity.ok(existingUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
