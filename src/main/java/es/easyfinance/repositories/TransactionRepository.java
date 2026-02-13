package es.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.TransactionModel;

public interface TransactionRepository extends JpaRepository<TransactionModel, Long> {

}
