package com.reservas.service;

import com.reservas.dto.ReservaResponse;
import com.reservas.entity.Reserva;
import com.reservas.entity.Servicio;
import com.reservas.entity.Usuario;
import com.reservas.repository.ReservaRepository;
import com.reservas.repository.ServicioRepository;
import com.reservas.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ReservaService.
 * Cubren el flujo de confirmación y rechazo de reservas,
 * aislando completamente la base de datos con mocks.
 */
@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ServicioRepository servicioRepository;

    @InjectMocks
    private ReservaService reservaService;

    private Reserva reservaMock;

    @BeforeEach
    void setUp() {
        // Construir usuario cliente mock
        Usuario clienteMock = new Usuario();
        clienteMock.setIdUsuario(10L);
        clienteMock.setNombre("Juan Perez");
        clienteMock.setEmail("juan@test.com");
        clienteMock.setTelefono("3001234567");
        clienteMock.setRol(Usuario.Rol.CLIENTE);

        // Construir servicio mock
        Servicio servicioMock = new Servicio();
        servicioMock.setIdServicio(1L);
        servicioMock.setNombreServicio("Consulta General");

        // Construir reserva mock en estado Pendiente
        reservaMock = new Reserva();
        reservaMock.setIdReserva(100L);
        reservaMock.setUsuario(clienteMock);
        reservaMock.setServicio(servicioMock);
        reservaMock.setFecha(LocalDate.now().plusDays(1));
        reservaMock.setHora(LocalTime.of(10, 0));
        reservaMock.setEstado("Pendiente");
        reservaMock.setCreadoEn(LocalDateTime.now());
    }

    // -------------------------------------------------------------------------
    // Prueba Unitaria 3: confirmarReserva() cambia el estado a "Confirmada"
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Debe confirmar una reserva existente y cambiar su estado a 'Confirmada'")
    void debeConfirmarReservaYCambiarEstado() {
        // Arrange — simular que la reserva existe en BD
        when(reservaRepository.findById(100L)).thenReturn(Optional.of(reservaMock));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva r = invocation.getArgument(0);
            r.setEstado("Confirmada");
            return r;
        });

        // Act
        ReservaResponse resultado = reservaService.confirmarReserva(100L);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getEstado()).isEqualTo("Confirmada");

        verify(reservaRepository, times(1)).findById(100L);
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    // -------------------------------------------------------------------------
    // Prueba Unitaria 4: rechazarReserva() lanza excepción si no existe
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Debe lanzar RuntimeException al intentar rechazar una reserva inexistente")
    void debeLanzarExcepcionAlRechazarReservaInexistente() {
        // Arrange — el repositorio no encuentra ninguna reserva con id 999
        when(reservaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reservaService.rechazarReserva(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Reserva no encontrada");

        verify(reservaRepository, times(1)).findById(999L);
        // Nunca debe llamarse save() si la reserva no existe
        verify(reservaRepository, never()).save(any(Reserva.class));
    }
}
