package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.Rol;
import es.easyfinance.repositories.RolRepository;

@Service
public class RolService {

	@Autowired
    private RolRepository rolRepository;

    // Buscar rol por id
    public Rol buscarPorId(Long id) {
        return rolRepository.findById(id).orElse(null);
    }

    // Buscar rol por nombre (ADMIN, USER)
    public Rol buscarPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre).orElse(null);
    }

    // Listar todos los roles
    public List<Rol> listarTodos() {
        return rolRepository.findAll();
    }

    // Guardar o actualizar rol
    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }

    // Comprobar si ya existe un rol con ese nombre
    public boolean nombreExiste(String nombre) {
        return rolRepository.existsByNombre(nombre);
    }
	
}
