package es.easyfinance.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
	
    // Validación Registro
    boolean existsByEmail(String email);
	
	// Login
    Optional<User> findByEmail(String email);
    
    // Listar usuarios activos (Admin)
    List<User> findByActivoTrue();
    
}
