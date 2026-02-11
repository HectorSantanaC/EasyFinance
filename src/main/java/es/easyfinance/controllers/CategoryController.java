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
	private CategoryService categoryService;

    @GetMapping
    public List<Category> listarTodas() {
    	return categoryService.listarTodas();
    }
    
    @GetMapping("/{id}")
    public Category buscarPorId(@PathVariable Long id) {
    	return categoryService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<Category> crear(@RequestBody Category c) {
    	return ResponseEntity.ok(categoryService.guardar(c));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Category> actualizar(@PathVariable Long id, @RequestBody Category c) {
    	c.setId(id);
    	return ResponseEntity.ok(categoryService.guardar(c));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	categoryService.borrar(id);
    	return ResponseEntity.ok().build();
    }

}
