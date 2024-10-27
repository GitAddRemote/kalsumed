package com.presstronic.kalsumed.service.user;

import com.presstronic.kalsumed.entity.user.ApplicationUser;
import com.presstronic.kalsumed.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
//
//    @Autowired
//    private RoleRepository roleRepository;

    public List<ApplicationUser> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<ApplicationUser> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public ApplicationUser createUser(ApplicationUser applicationUser) {
//         Assign default role "ROLE_GUEST" if no roles are specified
//        if (applicationUser.getRoles().isEmpty()) {
//            Role defaultRole = roleRepository.findByName("ROLE_GUEST");
//            applicationUser.getRoles().add(defaultRole);
//        }
        return userRepository.save(applicationUser);
    }

    public Optional<ApplicationUser> updateUser(Long id, ApplicationUser applicationUserDetails) {
        return userRepository.findById(id).map(user -> {
            user.setFirstName(applicationUserDetails.getFirstName());
            user.setLastName(applicationUserDetails.getLastName());
            user.setEmail(applicationUserDetails.getEmail());
            user.setPassword(applicationUserDetails.getPassword());
            user.setOauth2Provider(applicationUserDetails.getOauth2Provider());
            user.setOauth2Id(applicationUserDetails.getOauth2Id());
//            user.setRoles(applicationUserDetails.getRoles());
            return userRepository.save(user);
        });
    }

    public void deleteUser(Long id) {
         userRepository.deleteById(id);
    }

    public Optional<ApplicationUser> addRoleToUser(Long userId, String roleName) {
        return null; 
        /* userRepository.findById(userId).map(user -> {
            Role role = roleRepository.findByName(roleName);
            user.getRoles().add(role);
            return userRepository.save(user);
        });*/
    }

    public Optional<ApplicationUser> removeRoleFromUser(Long userId, String roleName) {
        return null; /*userRepository.findById(userId).map(user -> {
            Role role = roleRepository.findByName(roleName);
            user.getRoles().remove(role);
            return userRepository.save(user);
        });*/
    }
}
