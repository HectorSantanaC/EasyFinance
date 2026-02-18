package es.easyfinance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionTypeModel;

public interface CategoryRepository extends JpaRepository<CategoryModel, Long> {

	// Si tipo es ENUM → usa enum
    List<CategoryModel> findByTipo(TransactionTypeModel tipo);
    
    @Query("SELECT c FROM CategoryModel c WHERE c.nombre = :nombre AND c.tipo = :tipo AND c.esGlobal = :esGlobal")
    CategoryModel findFirstByNombreAndTipoAndEsGlobal(String nombre, TransactionTypeModel tipo, boolean esGlobal);

}
