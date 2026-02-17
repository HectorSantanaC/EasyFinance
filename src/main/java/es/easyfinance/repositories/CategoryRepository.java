package es.easyfinance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionTypeModel;

public interface CategoryRepository extends JpaRepository<CategoryModel, Long> {

	// ✅ Opción 1: Si tipo es ENUM → usa enum
    List<CategoryModel> findByTipo(TransactionTypeModel tipo);

}
