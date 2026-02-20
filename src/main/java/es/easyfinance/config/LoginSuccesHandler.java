package es.easyfinance.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class LoginSuccesHandler extends SimpleUrlAuthenticationSuccessHandler {
	
	@Autowired
	private UserRepository userRepository;
	
	@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication auth) throws IOException, ServletException {
        
        String email = auth.getName();
        
        UserModel user = userRepository.findByEmail(email);
        if (user != null) {
            user.setUltimoAcceso(LocalDateTime.now());
            userRepository.save(user);
            System.out.println("✅ Ultimo acceso: " + email);
        }
        
     // Redirección por rol (opcional)
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            getRedirectStrategy().sendRedirect(request, response, "/admin-users");
        } else {
            getRedirectStrategy().sendRedirect(request, response, "/dashboard");
        }
        
        super.onAuthenticationSuccess(request, response, auth);
    }

}
