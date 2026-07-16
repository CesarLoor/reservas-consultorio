/**
 * Prueba E2E #2 – Componente ReservaForm (páginas/ReservaForm.js)
 *
 * Simula el flujo completo de un usuario que:
 *  1. Carga el formulario (que consulta los servicios al backend)
 *  2. Completa todos los campos
 *  3. Envía el formulario
 *  4. Verifica el mensaje de éxito
 *
 * Nota: los <label> del componente no usan htmlFor, por eso los selects
 * no tienen nombre accesible en ARIA (Name: ""). Se usan selectores
 * alternativos: getAllByRole con índice y document.querySelector por type.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ReservaForm from '../pages/ReservaForm';

// ── Mocks de módulos externos ──────────────────────────────────────────────────

jest.mock('../services/api', () => ({
  serviciosApi: {
    obtenerServicios: jest.fn(),
  },
  reservasApi: {
    crearReserva: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

import { serviciosApi, reservasApi } from '../services/api';
import toast from 'react-hot-toast';

// ── Datos de prueba ────────────────────────────────────────────────────────────
const serviciosMock = [
  { idServicio: 1, nombreServicio: 'Consulta General', precio: 50000, duracionMinutos: 30 },
  { idServicio: 2, nombreServicio: 'Fisioterapia', precio: 80000, duracionMinutos: 60 },
];

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ReservaForm – Flujo E2E del formulario de reservas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    serviciosApi.obtenerServicios.mockResolvedValue({ data: serviciosMock });
  });

  // ---------------------------------------------------------------------------
  // E2E 2a: El formulario se renderiza y carga los servicios correctamente
  // ---------------------------------------------------------------------------
  test('debe mostrar el título y cargar los servicios desde el backend', async () => {
    render(
      <MemoryRouter>
        <ReservaForm />
      </MemoryRouter>
    );

    // El título debe estar visible de inmediato
    expect(screen.getByText('Nueva Reserva')).toBeInTheDocument();
    expect(screen.getByText('Completa el formulario para programar tu cita')).toBeInTheDocument();

    // El API debe ser invocado al montar el componente
    await waitFor(() => {
      expect(serviciosApi.obtenerServicios).toHaveBeenCalledTimes(1);
    });

    // Las opciones de los servicios deben aparecer en el select
    await waitFor(() => {
      expect(screen.getByText(/Consulta General/i)).toBeInTheDocument();
      expect(screen.getByText(/Fisioterapia/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // E2E 2b: Envío exitoso muestra toast de éxito
  // ---------------------------------------------------------------------------
  test('debe enviar el formulario correctamente y mostrar mensaje de éxito', async () => {
    // Arrange
    reservasApi.crearReserva.mockResolvedValueOnce({
      data: { idReserva: 10, estado: 'Pendiente' },
      status: 201,
    });

    // Act – renderizar (un solo render, capturando container)
    const { container } = render(
      <MemoryRouter>
        <ReservaForm />
      </MemoryRouter>
    );

    // Esperar que los servicios carguen
    await waitFor(() =>
      expect(screen.getByText(/Consulta General/i)).toBeInTheDocument()
    );

    // Completar campos de texto
    await userEvent.type(screen.getByPlaceholderText('Tu nombre completo'), 'Maria Lopez');
    await userEvent.type(screen.getByPlaceholderText('Ej: +57 300 123 4567'), '3001234567');
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'maria@test.com');

    // Los selects no tienen nombre ARIA (los label no tienen htmlFor en el componente).
    // Se obtienen por orden de aparición: [0]=idServicio, [1]=hora
    const [selectServicio, selectHora] = screen.getAllByRole('combobox');
    fireEvent.change(selectServicio, { target: { value: '1' } });
    fireEvent.change(selectHora, { target: { value: '10:00' } });

    // El input[type=date] tampoco tiene nombre ARIA; se accede por el container del render
    const inputFecha = container.querySelector('input[type="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(inputFecha, { target: { value: tomorrow.toISOString().split('T')[0] } });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert – API invocada y toast de éxito mostrado
    await waitFor(() => {
      expect(reservasApi.crearReserva).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(
        'Reserva creada exitosamente. Te contactaremos pronto!'
      );
    });
  });
});
