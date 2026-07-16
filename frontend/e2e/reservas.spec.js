const { test, expect } = require('@playwright/test');

const apiHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Content-Type': 'application/json',
};

function fulfillJson(route, body, status = 200) {
  return route.fulfill({
    status,
    headers: apiHeaders,
    body: JSON.stringify(body),
  });
}

function fulfillOptions(route) {
  return route.fulfill({
    status: 204,
    headers: apiHeaders,
  });
}

test('inicia sesion como administrador y muestra el resumen', async ({ page }) => {
  await page.route('http://localhost:8080/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      return fulfillOptions(route);
    }

    if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      expect(request.postDataJSON()).toEqual({
        email: 'admin@reservas.com',
        password: 'password',
      });

      return fulfillJson(route, {
        token: 'admin-token-e2e',
        nombre: 'Admin E2E',
        email: 'admin@reservas.com',
        rol: 'Administrador',
      });
    }

    if (url.pathname === '/api/reservas' && request.method() === 'GET') {
      return fulfillJson(route, [
        {
          idReserva: 1,
          nombreCliente: 'Ana Perez',
          emailCliente: 'ana@example.com',
          telefonoCliente: '0999999999',
          nombreServicio: 'Consulta general',
          fecha: '2026-07-20',
          hora: '09:00',
          estado: 'Pendiente',
          observaciones: 'Primera visita',
        },
        {
          idReserva: 2,
          nombreCliente: 'Luis Mora',
          emailCliente: 'luis@example.com',
          telefonoCliente: '0888888888',
          nombreServicio: 'Control medico',
          fecha: '2026-07-21',
          hora: '10:00',
          estado: 'Confirmada',
          observaciones: '',
        },
        {
          idReserva: 3,
          nombreCliente: 'Maria Soto',
          emailCliente: 'maria@example.com',
          telefonoCliente: '0777777777',
          nombreServicio: 'Terapia',
          fecha: '2026-07-22',
          hora: '11:00',
          estado: 'Rechazada',
          observaciones: '',
        },
      ]);
    }

    return fulfillJson(route, { message: 'Not mocked' }, 404);
  });

  await page.goto('/');
  await page.locator('input[type="email"]').fill('admin@reservas.com');
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Admin E2E')).toBeVisible();
  await expect(page.getByText('Total Reservas')).toBeVisible();
  await expect(page.getByText('Reservas Recientes')).toBeVisible();
});

test('confirma una reserva pendiente desde el panel administrativo', async ({ page }) => {
  let confirmacionSolicitada = null;
  let reservas = [
    {
      idReserva: 15,
      nombreCliente: 'Elena Torres',
      emailCliente: 'elena@example.com',
      telefonoCliente: '0666666666',
      nombreServicio: 'Revision odontologica',
      fecha: '2026-07-23',
      hora: '14:00',
      estado: 'Pendiente',
      observaciones: 'Paciente nueva',
    },
  ];

  await page.route('http://localhost:8080/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      return fulfillOptions(route);
    }

    if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      return fulfillJson(route, {
        token: 'admin-token-confirmacion',
        nombre: 'Admin Confirmacion',
        email: 'admin@reservas.com',
        rol: 'Administrador',
      });
    }

    if (url.pathname === '/api/reservas' && request.method() === 'GET') {
      return fulfillJson(route, reservas);
    }

    if (url.pathname === '/api/reservas/15/confirmar' && request.method() === 'PUT') {
      confirmacionSolicitada = {
        emailGestor: url.searchParams.get('emailGestor'),
        authorization: request.headers().authorization,
      };
      reservas = reservas.map((reserva) => ({
        ...reserva,
        estado: reserva.idReserva === 15 ? 'Confirmada' : reserva.estado,
      }));

      return fulfillJson(route, {
        ...reservas[0],
        usuarioGestor: {
          nombre: 'Admin Confirmacion',
          email: 'admin@reservas.com',
        },
      });
    }

    return fulfillJson(route, { message: 'Not mocked' }, 404);
  });

  await page.goto('/');
  await page.locator('input[type="email"]').fill('admin@reservas.com');
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'Reservas' }).click();
  await expect(page.getByText(/Gesti.n de Reservas/)).toBeVisible();
  await expect(page.getByText('Elena Torres')).toBeVisible();

  await page.getByRole('button', { name: 'Confirmar' }).click();

  await expect(page.getByText('Reserva confirmada')).toBeVisible();
  expect(confirmacionSolicitada).toEqual({
    emailGestor: 'admin@reservas.com',
    authorization: 'Bearer admin-token-confirmacion',
  });
  await expect(page.getByText('Confirmada')).toBeVisible();
});