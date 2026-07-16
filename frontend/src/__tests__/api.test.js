/**
 * Prueba E2E #1 – Servicio API (api.js)
 *
 * Verifica que los métodos del cliente axios llaman a los endpoints
 * correctos del backend. Se mockea axios para evitar llamadas reales
 * a la red (prueba de integración de capa de servicios).
 */

import axios from 'axios';
import { serviciosApi, reservasApi } from '../services/api';

// Mockear el módulo axios por completo
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return mockAxios;
});

describe('API Service – serviciosApi', () => {
  // Limpiar mocks entre cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // E2E 1a: obtenerServicios() realiza GET al endpoint correcto
  // ---------------------------------------------------------------------------
  test('obtenerServicios() debe llamar a GET /servicios y retornar los datos', async () => {
    // Arrange
    const serviciosMock = [
      { idServicio: 1, nombreServicio: 'Consulta General', precio: 50000 },
      { idServicio: 2, nombreServicio: 'Fisioterapia', precio: 80000 },
    ];
    axios.get.mockResolvedValueOnce({ data: serviciosMock, status: 200 });

    // Act
    const respuesta = await serviciosApi.obtenerServicios();

    // Assert
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/servicios');
    expect(respuesta.data).toEqual(serviciosMock);
    expect(respuesta.status).toBe(200);
  });

  // ---------------------------------------------------------------------------
  // E2E 1b: crearServicio() realiza POST con el payload correcto
  // ---------------------------------------------------------------------------
  test('crearServicio() debe llamar a POST /servicios con el cuerpo del servicio', async () => {
    // Arrange
    const nuevoServicio = {
      nombreServicio: 'Nutrición',
      precio: 60000,
      descripcion: 'Consulta nutricional',
      duracionMinutos: 45,
      activo: true,
    };
    const respuestaMock = { data: { idServicio: 3, ...nuevoServicio }, status: 200 };
    axios.post.mockResolvedValueOnce(respuestaMock);

    // Act
    const respuesta = await serviciosApi.crearServicio(nuevoServicio);

    // Assert
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('/servicios', nuevoServicio);
    expect(respuesta.data.idServicio).toBe(3);
    expect(respuesta.data.nombreServicio).toBe('Nutrición');
  });
});

describe('API Service – reservasApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // E2E 1c: crearReserva() realiza POST con los datos de la reserva
  // ---------------------------------------------------------------------------
  test('crearReserva() debe llamar a POST /reservas con los datos correctos', async () => {
    // Arrange
    const reservaData = {
      nombre: 'Ana García',
      telefono: '3109876543',
      email: 'ana@test.com',
      idServicio: 1,
      fecha: '2026-08-01',
      hora: '10:00',
    };
    const respuestaMock = {
      data: { idReserva: 55, estado: 'Pendiente', ...reservaData },
      status: 201,
    };
    axios.post.mockResolvedValueOnce(respuestaMock);

    // Act
    const respuesta = await reservasApi.crearReserva(reservaData);

    // Assert
    expect(axios.post).toHaveBeenCalledWith('/reservas', reservaData);
    expect(respuesta.data.estado).toBe('Pendiente');
    expect(respuesta.data.idReserva).toBe(55);
  });

  // ---------------------------------------------------------------------------
  // E2E 1d: confirmarReserva() realiza PUT al endpoint correcto
  // ---------------------------------------------------------------------------
  test('confirmarReserva() debe llamar a PUT /reservas/{id}/confirmar', async () => {
    // Arrange
    const idReserva = 55;
    const respuestaMock = { data: { idReserva, estado: 'Confirmada' }, status: 200 };
    axios.put.mockResolvedValueOnce(respuestaMock);

    // Act
    const respuesta = await reservasApi.confirmarReserva(idReserva);

    // Assert
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(
      `/reservas/${idReserva}/confirmar`,
      null,
      { params: {} }
    );
    expect(respuesta.data.estado).toBe('Confirmada');
  });
});
