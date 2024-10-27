package com.presstronic.kalsumed.service.role;

import com.presstronic.kalsumed.entity.role.Role;
import com.presstronic.kalsumed.repository.role.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public Optional<Role> findDefaultRole() {
        // FIXME: Make configurable
        return Optional.ofNullable(roleRepository.findByName("ROLE_GUEST"));
    }

    public Optional<Role> findByName(String roleName) {
        return Optional.ofNullable(roleRepository.findByName(roleName));
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}
