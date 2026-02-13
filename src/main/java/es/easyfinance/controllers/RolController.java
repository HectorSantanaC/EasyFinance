package es.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.RolModel;
import es.easyfinance.services.RolService;

@RestController
@RequestMapping("api/roles")
public class RolController {
	
	@Autowired
	private RolService rolService;
	
	@GetMapping
	public List<RolModel> listarTodos() {
		return rolService.listarTodos();
	}
	
	@GetMapping("/{id}")
	public RolModel buscarPorId(@PathVariable Long id) {
		return rolService.buscarPorId(id);
	}
	
	@GetMapping("/nombre/{nombre}")
	public RolModel buscarPorNombre(@PathVariable String nombre) {
		return rolService.buscarPorNombre(nombre);
	}

}
