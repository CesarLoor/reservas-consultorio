import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('./services/api', () => ({
  authApi: { login: jest.fn(), validateToken: jest.fn() },
  reservasApi: {},
  serviciosApi: {},
}));

describe('inicio de sesión', () => {
  test('muestra el formulario y las credenciales de prueba', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /iniciar sesi.n/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@reservas.com')).toBeInTheDocument();
    expect(screen.getByText(/credenciales de prueba/i)).toBeInTheDocument();
  });

  test('valida los campos obligatorios antes de enviar', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /iniciar sesi.n/i }));

    expect(await screen.findByText(/el email es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contrase.a es obligatoria/i)).toBeInTheDocument();
  });
});
