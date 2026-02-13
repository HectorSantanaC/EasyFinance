package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.repositories.TransactionRepository;

@Service
public class TransactionService {
	
	@Autowired
    private TransactionRepository transactionRepository;

    public TransactionModel buscarPorId(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public List<TransactionModel> listarTodas() {
        return transactionRepository.findAll();
    }

    public TransactionModel guardar(TransactionModel transaccion) {
        return transactionRepository.save(transaccion);
    }

    public void borrar(Long id) {
    	transactionRepository.deleteById(id);
    }

}
