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

import es.easyfinance.models.TransactionFilterModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.CategoryService;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;
import es.easyfinance.services.UserService;
import jakarta.servlet.http.HttpSession;

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
	public String register(Model model, HttpSession session) {
		
		UserModel usuarioTemp = (UserModel) session.getAttribute("usuarioTemp");
	    model.addAttribute("usuario", usuarioTemp != null ? usuarioTemp : new UserModel());
	    
	    // Limpiar sesión usuario temporal
	    session.removeAttribute("usuarioTemp");
		
		return "register";
	}
	
	@PostMapping(value = "/register")
	public String processRegister(@ModelAttribute UserModel usuario,
								  @RequestParam(required=false) String confirmPassword,
	                              RedirectAttributes redirectAttributes,
	                              HttpSession session) {
	    
	    // Validaciones
	    if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "Nombre es obligatorio.");
	        return "redirect:/register";
	    }
	    
	    if (usuario.getApellidos() == null || usuario.getApellidos().trim().isEmpty()) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "Apellidos es obligatorio.");
	        return "redirect:/register";
	    }
	    
	    if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "Email es obligatorio.");
	        return "redirect:/register";
	    }
	    
	    if (userService.emailExiste(usuario.getEmail())) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "El email ya está registrado.");
	        return "redirect:/register";
	    }
	    
	    if (usuario.getContrasena() == null || usuario.getContrasena().length() < 8) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "La contraseña debe tener al menos 8 caracteres.");
	        return "redirect:/register";
	    }
	    
	    if (confirmPassword == null || !usuario.getContrasena().equals(confirmPassword)) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "Las contraseñas no coinciden.");
	        return "redirect:/register";
	    }	    

	    try {
	        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
	        usuario.setFechaRegistro(LocalDate.now());
	        usuario.setActivo(true);
	        usuario.setCreadoPor(1L);
	        usuario.setFechaCreacion(LocalDateTime.now());
	        
	        UserModel usuarioGuardado = userService.guardar(usuario);
	        userService.asignarRolUsuario(usuarioGuardado, 2L);
	        
	        session.removeAttribute("usuarioTemp"); // Limpia usuario temporal
	        
	        redirectAttributes.addFlashAttribute("mensajeExito", 
	            "¡Registro completado! Puedes iniciar sesión.");
	        
	        return "redirect:/login";
	        
	    } catch (Exception e) {
	        session.setAttribute("usuarioTemp", usuario);
	        redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
	        
	        return "redirect:/register";
	    }
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
            @ModelAttribute TransactionFilterModel filtro,
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
	
	@GetMapping("/contact")
	public String contact() {
	    return "contact";
	}
	
	@GetMapping("/help")
	public String help() {
	    return "help";
	}
	
	@GetMapping("/terms")
	public String terms() {
	    return "terms";
	}
	
	@GetMapping("/privacy")
	public String privacy() {
	    return "privacy";
	}

}
