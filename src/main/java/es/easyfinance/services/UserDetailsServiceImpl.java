package es.easyfinance.services;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	
	private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserModel userModel = userRepository.findByEmail(email)
                .filter(u -> u.isActivo())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        String rolNombre = userModel.getRolId() != null ? userModel.getRolId().getNombre() : "USER";
        String authority = "ROLE_" + rolNombre.toUpperCase();

        return User.builder()
        		.username(userModel.getEmail())
        		.password(userModel.getContrasena())
        		.authorities(new SimpleGrantedAuthority(authority))
        		.build();
    }

}
