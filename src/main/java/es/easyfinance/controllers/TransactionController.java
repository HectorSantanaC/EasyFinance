package es.easyfinance.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.SavingsGoalModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.SavingsGoalService;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/transacciones")
public class TransactionController {
	
	@Autowired
	private TransactionService transactionService;
	
	@Autowired
	private UserDetailsServiceImpl userDetailsService;
	
	@Autowired
	private SavingsGoalService savingsGoalService;
	
	private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }

	@GetMapping(produces = "application/json")
	public ResponseEntity<Page<TransactionModel>> listar(@RequestParam(defaultValue = "0") int page,
	    @RequestParam(defaultValue = "10") int size) {
	    
	    UserModel usuario = usuarioActual();

	    Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
	    Page<TransactionModel> pageTrans = transactionService.findAllByUsuario(usuario, pageable);
	    
	    return ResponseEntity.ok(pageTrans);
	}

    
    @GetMapping("/{id}")
    public TransactionModel buscarPorId(@PathVariable Long id) {
    	return transactionService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<TransactionModel> crear(@RequestParam Map<String, String> data) {
    	
        TransactionModel transaction = new TransactionModel();
        
        transaction.setDescripcion(data.get("descripcion"));
        transaction.setCantidad(new BigDecimal(data.get("importe")));
        transaction.setTipo(TransactionTypeModel.valueOf(data.get("tipo")));
        transaction.setFecha(LocalDate.parse(data.get("fecha")));
        transaction.setUsuarioId(usuarioActual());
        
        // CATEGORÍA (INGRESO/GASTO)
        if ("INGRESO".equals(data.get("tipo")) || "GASTO".equals(data.get("tipo"))) {
            CategoryModel categoria = new CategoryModel();
            categoria.setId(Long.parseLong(data.get("idCategoria")));
            transaction.setCategoriaId(categoria);
            
         // AHORRO: META
        } else if ("AHORRO".equals(data.get("tipo"))) {
            SavingsGoalModel meta = new SavingsGoalModel();
            meta.setId(Long.parseLong(data.get("idMeta")));
            transaction.setMetaAhorroId(meta);
            
            // Actualizar cantidad meta
            SavingsGoalModel metaDb = savingsGoalService.buscarPorId(meta.getId());
            if (metaDb != null) {
                BigDecimal cantidadActual = metaDb.getCantidadActual() != null ? 
                    metaDb.getCantidadActual() : BigDecimal.ZERO;
                metaDb.setCantidadActual(cantidadActual.add(transaction.getCantidad()));
                savingsGoalService.guardar(metaDb);
            }
        }
        
        return ResponseEntity.ok(transactionService.guardar(transaction));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TransactionModel> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> data) {
    	
        TransactionModel original = transactionService.buscarPorId(id);
        
        if (original == null || !original.getUsuarioId().getId().equals(usuarioActual().getId())) {
            return ResponseEntity.notFound().build();
        }

        // DATOS ORIGINALES META
        TransactionTypeModel tipoOriginal = original.getTipo();
        BigDecimal importeOriginal = original.getCantidad();
        Long metaIdOriginal = original.getMetaAhorroId() != null ? original.getMetaAhorroId().getId() : null;

        // ACTUALIZAR CAMPOS
        if (data.get("descripcion") != null) {
            original.setDescripcion((String) data.get("descripcion"));
        }
        if (data.get("importe") != null && !"".equals(data.get("importe"))) {
            original.setCantidad(new BigDecimal(data.get("importe").toString()));
        }
        if (data.get("fecha") != null && !"".equals(data.get("fecha"))) {
            original.setFecha(LocalDate.parse((String) data.get("fecha")));
        }

        // TIPO
        TransactionTypeModel nuevoTipo = original.getTipo();
        if (data.get("tipo") != null && !"".equals(data.get("tipo"))) {
            nuevoTipo = TransactionTypeModel.valueOf((String) data.get("tipo"));
            original.setTipo(nuevoTipo);
        }

        // CATEGORÍA (INGRESO/GASTO)
        if (data.containsKey("idCategoria") && nuevoTipo != TransactionTypeModel.AHORRO) {
            String catStr = data.get("idCategoria").toString();
            if (catStr != null && !"".equals(catStr) && !"null".equals(catStr)) {
                CategoryModel categoria = new CategoryModel();
                categoria.setId(Long.parseLong(catStr));
                original.setCategoriaId(categoria);
            }
        }
        
        // META (AHORRO)
        Long metaIdNueva = null;
        
        if (nuevoTipo == TransactionTypeModel.AHORRO && data.containsKey("idMeta")) {
            String metaStr = data.get("idMeta").toString();
            if (metaStr != null && !"".equals(metaStr) && !"null".equals(metaStr)) {
                metaIdNueva = Long.parseLong(metaStr);
                SavingsGoalModel meta = new SavingsGoalModel();
                meta.setId(metaIdNueva);
                original.setMetaAhorroId(meta);
            }
        }

        // LÓGICA META
        if (nuevoTipo == TransactionTypeModel.AHORRO && metaIdNueva != null && metaIdNueva.equals(metaIdOriginal)) {
            SavingsGoalModel metaDb = savingsGoalService.buscarPorId(metaIdNueva);
            if (metaDb != null) {
                BigDecimal diff = original.getCantidad().subtract(importeOriginal);
                metaDb.setCantidadActual(metaDb.getCantidadActual().add(diff));
                savingsGoalService.guardar(metaDb);
            }
        } else if (metaIdOriginal != null && tipoOriginal == TransactionTypeModel.AHORRO && nuevoTipo != TransactionTypeModel.AHORRO) {
            SavingsGoalModel metaDb = savingsGoalService.buscarPorId(metaIdOriginal);
            if (metaDb != null) {
                metaDb.setCantidadActual(metaDb.getCantidadActual().subtract(importeOriginal));
                savingsGoalService.guardar(metaDb);
            }
        }

        return ResponseEntity.ok(transactionService.guardar(original));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        // SEGURIDAD: solo propias
        TransactionModel transaccion = transactionService.buscarPorId(id);
        if (transaccion == null || !transaccion.getUsuarioId().getId().equals(usuarioActual().getId())) {
            return ResponseEntity.notFound().build();
        }
        
        transactionService.borrar(id);
        return ResponseEntity.ok().build();
    }

}
