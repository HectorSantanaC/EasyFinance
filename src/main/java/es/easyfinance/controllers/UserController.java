package es.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.UserModel;
import es.easyfinance.services.UserService;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {
	
	@Autowired
    private UserService userService;

	@GetMapping
	public List<UserModel> listarTodos() {
	    return userService.listarTodos();
	}
	
	@GetMapping("/activos")
	public List<UserModel> listarActivos() {
	    return userService.listarActivos();
	}
	
	@GetMapping("/{id}")
	public UserModel buscarPorId(@PathVariable Long id) {
	    return userService.buscarPorId(id);
	}
	
	@PostMapping
	public ResponseEntity<UserModel> crear(@RequestBody UserModel user) {
	    if (userService.emailExiste(user.getEmail())) {
	        return ResponseEntity.badRequest().build();
	    }
	    UserModel saved = userService.guardar(user);
	    return ResponseEntity.ok(saved);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<UserModel> actualizar(@PathVariable Long id, @RequestBody UserModel user) {
	    UserModel existing = userService.buscarPorId(id);
	    if (existing == null) {
	        return ResponseEntity.notFound().build();
	    }
	    user.setId(id);
	    UserModel updated = userService.guardar(user);
	    return ResponseEntity.ok(updated);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> borrar(@PathVariable Long id) {
	    UserModel existing = userService.buscarPorId(id);
	    if (existing == null) {
	        return ResponseEntity.notFound().build();
	    }
	    userService.borrar(id);
	    return ResponseEntity.ok().build();
	}
}
