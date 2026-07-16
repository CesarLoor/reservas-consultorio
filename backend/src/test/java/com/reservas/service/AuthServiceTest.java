package com.reservas.service;

import com.reservas.dto.LoginRequest;
import com.reservas.dto.LoginResponse;
import com.reservas.entity.Usuario;
import com.reservas.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginConAdministradorValidoRetornaTokenYDatosDelUsuario() {
        Usuario administrador = new Usuario("Admin Reservas", "0999999999", "admin@reservas.com", Usuario.Rol.ADMINISTRADOR);
        administrador.setPassword("password-cifrado");

        when(usuarioRepository.findByEmail("admin@reservas.com")).thenReturn(Optional.of(administrador));
        when(passwordEncoder.matches("password", "password-cifrado")).thenReturn(true);

        LoginResponse response = authService.login(new LoginRequest("admin@reservas.com", "password"));

        assertTrue(response.getToken().startsWith("admin-token-"));
        assertEquals("Admin Reservas", response.getNombre());
        assertEquals("admin@reservas.com", response.getEmail());
        assertEquals("Administrador", response.getRol());
        verify(usuarioRepository).findByEmail("admin@reservas.com");
        verify(passwordEncoder).matches("password", "password-cifrado");
    }

    @Test
    void loginConRolClienteRechazaAccesoAdministrativo() {
        Usuario cliente = new Usuario("Cliente Reservas", "0888888888", "cliente@reservas.com", Usuario.Rol.CLIENTE);
        cliente.setPassword("password-cifrado");

        when(usuarioRepository.findByEmail("cliente@reservas.com")).thenReturn(Optional.of(cliente));
        when(passwordEncoder.matches("password", "password-cifrado")).thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(new LoginRequest("cliente@reservas.com", "password"))
        );

        assertEquals("No tienes permisos de administrador", exception.getMessage());
        verify(usuarioRepository).findByEmail("cliente@reservas.com");
        verify(passwordEncoder).matches("password", "password-cifrado");
    }
}
