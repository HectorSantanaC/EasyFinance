package es.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.CategoryModel;

public interface CategoryRepository extends JpaRepository<CategoryModel, Long> {

}
