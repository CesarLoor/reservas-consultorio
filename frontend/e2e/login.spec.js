const { test, expect } = require('@playwright/test');

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
