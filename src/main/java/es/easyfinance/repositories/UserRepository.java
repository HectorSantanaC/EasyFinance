package es.easyfinance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Long> {
	
    // Validación Registro
    boolean existsByEmail(String email);
	
    // Buscar por email
    UserModel findByEmail(String email);
    
    // Listar usuarios activos (Admin)
    List<UserModel> findByActivoTrue();
    
}
