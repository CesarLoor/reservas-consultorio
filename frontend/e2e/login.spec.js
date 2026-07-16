const { test, expect } = require('@playwright/test');

const TOAST_DURATION = 12000;

test('muestra la pantalla de inicio de sesión', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /iniciar sesi.n/i })).toBeVisible();
  await expect(page.getByPlaceholder('admin@reservas.com')).toBeVisible();
  await expect(page.getByText(/credenciales de prueba/i)).toBeVisible();
});

test('impide enviar el login con campos vacíos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /iniciar sesi.n/i }).click();

  await expect(page.getByText(/el email es obligatorio/i)).toBeVisible();
  await expect(page.getByText(/la contrase.a es obligatoria/i)).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('validación de formato de email inválido', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('admin@reservas.com').fill('correo@');
  await page.evaluate(() => document.querySelector('form').noValidate = true);
  await page.getByRole('button', { name: /iniciar sesi.n/i }).click();

  await expect(page.getByText(/email inv.lido/i)).toBeVisible();
});

test('toggle de visibilidad de la contraseña', async ({ page }) => {
  await page.goto('/');

  const passwordInput = page.getByPlaceholder('Tu contraseña');
  await expect(passwordInput).toHaveAttribute('type', 'password');

  await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first().click();
  await expect(passwordInput).toHaveAttribute('type', 'text');

  await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first().click();
  await expect(passwordInput).toHaveAttribute('type', 'password');
});

test('muestra mensaje de error con credenciales incorrectas', async ({ page }) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Credenciales incorrectas' }),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('admin@reservas.com').fill('admin@reservas.com');
  await page.getByPlaceholder('Tu contraseña').fill('wrongpassword');
  await page.getByRole('button', { name: /iniciar sesi.n/i }).click();

  await expect(page.getByText(/credenciales incorrectas/i)).toBeVisible({ timeout: TOAST_DURATION });
  await expect(page).toHaveURL('/');
});

test('login exitoso redirige al dashboard', async ({ page }) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'test-token-123',
        nombre: 'Admin Test',
        email: 'admin@reservas.com',
        rol: 'Administrador',
      }),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('admin@reservas.com').fill('admin@reservas.com');
  await page.getByPlaceholder('Tu contraseña').fill('password');
  await page.getByRole('button', { name: /iniciar sesi.n/i }).click();

  await expect(page.getByText(/bienvenido al sistema/i)).toBeVisible({ timeout: TOAST_DURATION });
  await expect(page).toHaveURL(/\/dashboard/);
});
