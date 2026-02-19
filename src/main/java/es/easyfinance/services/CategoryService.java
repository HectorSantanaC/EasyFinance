package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.repositories.CategoryRepository;

@Service
public class CategoryService {
	
	@Autowired
    private CategoryRepository categoryRepository;

    public CategoryModel buscarPorId(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public List<CategoryModel> listarTodas() {
        return categoryRepository.findAll();
    }

    public CategoryModel guardar(CategoryModel categoria) {
        return categoryRepository.save(categoria);
    }

    public void borrar(Long id) {
    	categoryRepository.deleteById(id);
    }
    
 // Método con ENUM
    public List<CategoryModel> findByTipo(TransactionTypeModel tipo) {
        return categoryRepository.findByTipo(tipo);
    }
    
    public List<CategoryModel> listarGlobalesActivas() {
        return categoryRepository.findByEsGlobalTrueAndActivaTrueOrderByNombreAsc();
    }

}
