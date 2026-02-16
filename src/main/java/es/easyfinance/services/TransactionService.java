package es.easyfinance.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
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
    
    public BigDecimal calcularIngresosMesActual(String email) {
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
        return transactionRepository.findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
          email, TransactionTypeModel.INGRESO, inicioMes
        ).stream()
          .map(TransactionModel::getCantidad)
          .filter(Objects::nonNull)
          .reduce(BigDecimal.ZERO, BigDecimal::add);
      }
      
    public BigDecimal calcularGastosMesActual(String email) {
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
        return transactionRepository.findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
          email, TransactionTypeModel.GASTO, inicioMes
        ).stream()
          .map(TransactionModel::getCantidad)
          .filter(Objects::nonNull)
          .reduce(BigDecimal.ZERO, BigDecimal::add);
      }
}
