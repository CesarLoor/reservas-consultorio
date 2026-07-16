package com.reservas.service;

import com.reservas.dto.ServicioRequest;
import com.reservas.dto.ServicioResponse;
import com.reservas.entity.Servicio;
import com.reservas.repository.ServicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ServicioService.
 * Se utilizan mocks para aislar la lógica de negocio del repositorio.
 */
@ExtendWith(MockitoExtension.class)
class ServicioServiceTest {

    @Mock
    private ServicioRepository servicioRepository;

    @InjectMocks
    private ServicioService servicioService;

    private Servicio servicioMock;

    @BeforeEach
    void setUp() {
        servicioMock = new Servicio();
        servicioMock.setIdServicio(1L);
        servicioMock.setNombreServicio("Consulta General");
        servicioMock.setPrecio(50000);
        servicioMock.setDescripcion("Consulta médica general");
        servicioMock.setDuracionMinutos(30);
        servicioMock.setActivo(true);
        servicioMock.setCreatedAt(LocalDateTime.now());
    }

    // -------------------------------------------------------------------------
    // Prueba Unitaria 1: crearServicio() guarda y retorna el DTO correctamente
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Debe crear un servicio y retornar su DTO con los datos correctos")
    void debeCrearServicioYRetornarDTO() {
        // Arrange
        ServicioRequest request = new ServicioRequest();
        request.setNombreServicio("Consulta General");
        request.setPrecio(50000);
        request.setDescripcion("Consulta médica general");
        request.setDuracionMinutos(30);
        request.setActivo(true);

        when(servicioRepository.save(any(Servicio.class))).thenReturn(servicioMock);

        // Act
        ServicioResponse resultado = servicioService.crearServicio(request);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getNombreServicio()).isEqualTo("Consulta General");
        assertThat(resultado.getPrecio()).isEqualTo(50000);
        assertThat(resultado.getDuracionMinutos()).isEqualTo(30);
        assertThat(resultado.getActivo()).isTrue();

        // Verificar que el repositorio fue invocado exactamente una vez
        verify(servicioRepository, times(1)).save(any(Servicio.class));
    }

    // -------------------------------------------------------------------------
    // Prueba Unitaria 2: obtenerTodosLosServicios() retorna la lista completa
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("Debe retornar todos los servicios (activos e inactivos) como lista de DTOs")
    void debeObtenerTodosLosServicios() {
        // Arrange
        Servicio servicioInactivo = new Servicio();
        servicioInactivo.setIdServicio(2L);
        servicioInactivo.setNombreServicio("Servicio Inactivo");
        servicioInactivo.setPrecio(30000);
        servicioInactivo.setDescripcion("Servicio desactivado");
        servicioInactivo.setDuracionMinutos(60);
        servicioInactivo.setActivo(false);
        servicioInactivo.setCreatedAt(LocalDateTime.now());

        when(servicioRepository.findAll()).thenReturn(Arrays.asList(servicioMock, servicioInactivo));

        // Act
        List<ServicioResponse> resultados = servicioService.obtenerTodosLosServicios();

        // Assert
        assertThat(resultados).isNotNull();
        assertThat(resultados).hasSize(2);
        assertThat(resultados.get(0).getNombreServicio()).isEqualTo("Consulta General");
        assertThat(resultados.get(1).getNombreServicio()).isEqualTo("Servicio Inactivo");
        assertThat(resultados.get(1).getActivo()).isFalse();

        verify(servicioRepository, times(1)).findAll();
    }
}
