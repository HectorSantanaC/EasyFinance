package es.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.Rol;
import es.easyfinance.services.RolService;

@RestController
@RequestMapping("api/roles")
public class RolController {
	
	@Autowired
	private RolService rolService;
	
	@GetMapping
	public List<Rol> listarTodos() {
		return rolService.listarTodos();
	}
	
	@GetMapping("/{id}")
	public Rol buscarPorId(@PathVariable Long id) {
		return rolService.buscarPorId(id);
	}
	
	@GetMapping("/nombre/{nombre}")
	public Rol buscarPorNombre(@PathVariable String nombre) {
		return rolService.buscarPorNombre(nombre);
	}

}
