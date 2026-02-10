package es.easyfinance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

}
