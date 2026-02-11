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

import es.easyfinance.models.Category;
import es.easyfinance.services.CategoryService;

@RestController
@RequestMapping("/api/categorias")
public class CategoryController {
	
	@Autowired
	private CategoryService service;

    @GetMapping
    public List<Category> listarTodas() {
    	return service.listarTodas();
    }
    
    @GetMapping("/{id}")
    public Category buscarPorId(@PathVariable Long id) {
    	return service.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<Category> crear(@RequestBody Category c) {
    	return ResponseEntity.ok(service.guardar(c));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Category> actualizar(@PathVariable Long id, @RequestBody Category c) {
    	c.setId(id);
    	return ResponseEntity.ok(service.guardar(c));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	service.borrar(id);
    	return ResponseEntity.ok().build();
    }

}
