package es.easyfinance.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import es.easyfinance.models.Rol;

@Repository
public interface RolRepository extends JpaRepository <Rol, Long> {
	
	Optional<Rol> findByNombre(String nombre);
    
    boolean existsByNombre(String nombre);

}
