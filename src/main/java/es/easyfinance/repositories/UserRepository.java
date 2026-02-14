package es.easyfinance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.easyfinance.models.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Long> {
	
    // Validación Registro
    boolean existsByEmail(String email);
	
    @Query("SELECT u FROM UserModel u WHERE u.email = :email")
    UserModel findByEmail(@Param("email") String email);
    
    // Listar usuarios activos (Admin)
    List<UserModel> findByActivoTrue();
    
}
