package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.User;
import es.easyfinance.repositories.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	// Buscar usuario por id
	public User buscarPorId(Long id) {
		return userRepository.findById(id).orElse(null);
	}
	
	 // Buscar usuario por email (para login, etc.)
    public User buscarPorEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
 // Listar todos los usuarios
    public List<User> listarTodos() {
        return userRepository.findAll();
    }

    // Listar solo usuarios activos
    public List<User> listarActivos() {
        return userRepository.findByActivoTrue();
    }

    // Guardar o actualizar usuario
    public User guardar(User user) {
        return userRepository.save(user);
    }

    // Borrar usuario por id
    public void borrar(Long id) {
        userRepository.deleteById(id);
    }

    // Comprobar si ya existe un email (para registro)
    public boolean emailExiste(String email) {
        return userRepository.existsByEmail(email);
    }

}
