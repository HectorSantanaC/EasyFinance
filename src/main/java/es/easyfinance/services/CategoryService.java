package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.Category;
import es.easyfinance.repositories.CategoryRepository;

@Service
public class CategoryService {
	
	@Autowired
    private CategoryRepository categoryRepository;

    public Category buscarPorId(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public List<Category> listarTodas() {
        return categoryRepository.findAll();
    }

    public Category guardar(Category categoria) {
        return categoryRepository.save(categoria);
    }

    public void borrar(Long id) {
    	categoryRepository.deleteById(id);
    }

}
