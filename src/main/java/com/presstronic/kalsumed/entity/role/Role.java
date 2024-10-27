package com.presstronic.kalsumed.entity.role;

import com.presstronic.kalsumed.entity.user.ApplicationUser;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String friendlyName;

    @ManyToMany(mappedBy = "roles")
    private Set<ApplicationUser> applicationUsers = new HashSet<>();

    // Default constructor
    public Role() {}

    // Constructor with name parameter
    public Role(String name, String friendlyName) {
        this.name = name;
        this.friendlyName = friendlyName;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFriendlyName() {
        return friendlyName;
    }

    public void setFriendlyName(String friendlyName) {
        this.friendlyName = friendlyName;
    }

    public Set<ApplicationUser> getUsers() {
        return applicationUsers;
    }

    public void setUsers(Set<ApplicationUser> applicationUsers) {
        this.applicationUsers = applicationUsers;
    }
}
