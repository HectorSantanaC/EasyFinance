package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.TransactionRepository;

@Service
public class TransactionService {
	
	@Autowired
    private TransactionRepository transactionRepository;
	
	public Page<TransactionModel> findAllByUsuario(UserModel userModel, Pageable pageable) {
		return transactionRepository.findByUsuarioId(userModel, pageable); 
	}

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
    
    public List<TransactionModel> findTop5ByUsuario(UserModel usuario) {
        return transactionRepository.findTop5ByUsuarioIdOrderByFechaDesc(usuario);
    }
    
    public List<TransactionModel> findTop5ByUsuarioAndTipo(UserModel usuario, String tipo) {
        return transactionRepository.findTop5ByUsuarioIdAndTipoNameOrderByFechaDesc(usuario, tipo);
    }
}
