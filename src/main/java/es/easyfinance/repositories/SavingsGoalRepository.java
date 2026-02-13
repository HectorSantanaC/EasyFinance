package es.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.SavingsGoalModel;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoalModel, Long> {

}
