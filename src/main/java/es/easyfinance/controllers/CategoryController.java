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

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.services.CategoryService;

@RestController
@RequestMapping("/api/categorias")
public class CategoryController {
	
	@Autowired
	private CategoryService categoryService;

    @GetMapping
    public List<CategoryModel> listarTodas() {
    	return categoryService.listarTodas();
    }
    
    @GetMapping("/{id}")
    public CategoryModel buscarPorId(@PathVariable Long id) {
    	return categoryService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<CategoryModel> crear(@RequestBody CategoryModel category) {
    	return ResponseEntity.ok(categoryService.guardar(category));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CategoryModel> actualizar(@PathVariable Long id, @RequestBody CategoryModel category) {
    	category.setId(id);
    	return ResponseEntity.ok(categoryService.guardar(category));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	categoryService.borrar(id);
    	return ResponseEntity.ok().build();
    }
    
    @GetMapping("/ingreso")
    public ResponseEntity<List<CategoryModel>> getCategoriasIngreso() {
        List<CategoryModel> resultado = categoryService.findByTipo(TransactionTypeModel.INGRESO);
        System.out.println("✅ Controller: Encontradas " + resultado.size() + " categorías INGRESO");
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/gasto")
    public ResponseEntity<List<CategoryModel>> getCategoriasGasto() {
        List<CategoryModel> resultado = categoryService.findByTipo(TransactionTypeModel.GASTO);
        System.out.println("✅ Controller: Encontradas " + resultado.size() + " categorías GASTO");
        return ResponseEntity.ok(resultado);
    }

}
