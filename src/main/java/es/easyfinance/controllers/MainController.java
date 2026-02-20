package es.easyfinance.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import es.easyfinance.dto.TransactionFilterDTO;
import es.easyfinance.models.RolModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.CategoryService;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;
import es.easyfinance.services.UserService;

@Controller
public class MainController {
	
	@Autowired
	private TransactionService transactionService;
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService;
	
	@Autowired
    private CategoryService categoryService;
	
	@Autowired
	private UserService userService;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

    private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }
	
	@GetMapping(value = {"/", "/index"})
	public String index() {
		return "index";
	}
	
	@GetMapping(value = "/register")
	public String register(Model model) {
		
		model.addAttribute("usuario", new UserModel());
		
		return "register";
	}
	
	@PostMapping(value = "/register")
	public String processRegister(@ModelAttribute UserModel usuario, 
	                              RedirectAttributes redirectAttributes) {
	    
	    // Validación
	    if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
	        redirectAttributes.addFlashAttribute("error", "Email es obligatorio.");
	        return "redirect:/register";
	    }
	    
	    if (userService.emailExiste(usuario.getEmail())) {
	        redirectAttributes.addFlashAttribute("error", "El email ya está registrado.");
	        return "redirect:/register";
	    }
	    
	    if (usuario.getContrasena() == null || usuario.getContrasena().length() < 8) {
	        redirectAttributes.addFlashAttribute("error", "La contraseña debe tener al menos 8 caracteres.");
	        return "redirect:/register";
	    }

	    // Encriptar contraseña
	    usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
	    usuario.setFechaRegistro(LocalDate.now());
	    
	   
	 // ASIGNAR ROL USUARIO
	    RolModel rolUsuario = new RolModel();
	    rolUsuario.setId(2L);  // ← ID del rol USUARIO
	    usuario.setRolId(rolUsuario);
	    usuario.setActivo(true);
	    usuario.setFechaRegistro(LocalDate.now());
	    usuario.setCreadoPor(1L);
	    usuario.setFechaCreacion(LocalDateTime.now());
	    
	    
	    
	    try {
	        userService.guardar(usuario);
	        redirectAttributes.addFlashAttribute("mensajeExito", 
	            "¡Registro completado! Puedes iniciar sesión.");
	    } catch (Exception e) {
	        redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
	        return "redirect:/register";
	    }
	    
	    return "redirect:/login";
	}

	
	@GetMapping(value = "/login")
	public String login(Model model) {
		return "login";
	}
	
	@GetMapping(value = "/dashboard")
	public String dashboard(Model model, Authentication auth) {
	    
		UserModel usuario = usuarioActual();
		
		// Balance, ingresos, gastos y ahorros
		String email = usuario.getEmail();
		
		model.addAttribute("balanceMes", transactionService.calcularBalanceMesActual(email));
		model.addAttribute("ingresosMes", transactionService.calcularIngresosMesActual(email));
		model.addAttribute("gastosMes", transactionService.calcularGastosMesActual(email));
		model.addAttribute("ahorrosMes", transactionService.calcularAhorrosMesActual(email));
		
		// Transacciones
	    Pageable pageable = PageRequest.of(0, 5, Sort.by("fecha").descending());
	    Page<TransactionModel> ultimas = transactionService.findAllByUsuario(usuario, pageable);
	    
	    model.addAttribute("ultimasTransacciones", ultimas.getContent());
	    
	    // Fecha
	    LocalDate ahora = LocalDate.now();
	    String mesActual = ahora.getMonth().getDisplayName(TextStyle.FULL_STANDALONE, Locale.forLanguageTag("es"))
                .toUpperCase().substring(0, 1) + 
                ahora.getMonth().getDisplayName(TextStyle.FULL_STANDALONE, Locale.forLanguageTag("es")).substring(1)
                + " " + ahora.getYear();

		model.addAttribute("mesActual", mesActual);
		
	    return "dashboard";
	}

	@GetMapping(value = "/transactions")
	public String transactions(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute TransactionFilterDTO filtro,
            Model model, Authentication auth) {
		
		UserModel usuario = usuarioActual();
		
		// Ingresos y gastos
		String email = usuario.getEmail();
		
		
		model.addAttribute("ingresosMes", transactionService.calcularIngresosMesActual(email));
		model.addAttribute("gastosMes", transactionService.calcularGastosMesActual(email));
		model.addAttribute("balanceMes", transactionService.calcularBalanceMesActual(email));
        
		// Transacciones
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        Page<TransactionModel> transaccionesPage = transactionService.findByFilters(usuario,filtro, pageable);
		
        model.addAttribute("transacciones", transaccionesPage.getContent());
        model.addAttribute("currentPage", transaccionesPage.getNumber());
        model.addAttribute("totalPages", transaccionesPage.getTotalPages());
        model.addAttribute("totalItems", transaccionesPage.getTotalElements());
        model.addAttribute("filtro", filtro);
        model.addAttribute("categorias", categoryService.listarTodas());
        
		return "transactions";
	}
	
	@GetMapping(value = "/savings")
	public String savings(Authentication auth) {
		return "savings";
	}
	
	@GetMapping(value = "/categories")
	public String categories(Authentication auth) {
		return "categories";
	}
	
	@GetMapping(value = "/admin-users")
	public String adminUsers(Authentication auth) {
		return "admin-users";
	}
	
	@GetMapping(value = "/admin-categories")
	public String adminCategories(Authentication auth) {
		return "admin-categories";
	}

}
