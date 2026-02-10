package es.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}
