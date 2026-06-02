import { http, HttpResponse } from 'msw';
import type { Role } from '../../services/auth.service';

interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  is_active: boolean;
  orders_count: number;
}

// In-memory user storage (persists within MSW worker lifecycle)
const users: MockUser[] = [
  {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
    role: 'BUYER',
    is_active: true,
    orders_count: 0,
  },
];

let nextId = 2;

function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const authHandlers = [
  // POST /api/v1/auth/register
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    // Validation: check required fields
    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { detail: 'Все поля обязательны для заполнения' },
        { status: 422 }
      );
    }

    // Validation: name length
    if (body.name.length < 3 || body.name.length > 30) {
      return HttpResponse.json(
        { detail: 'Имя должно быть от 3 до 30 символов' },
        { status: 422 }
      );
    }

    // Validation: password length
    if (body.password.length < 6 || body.password.length > 50) {
      return HttpResponse.json(
        { detail: 'Пароль должен быть от 6 до 50 символов' },
        { status: 422 }
      );
    }

    // Validation: email format
    if (!body.email.includes('@')) {
      return HttpResponse.json(
        { detail: 'Некорректный формат email' },
        { status: 422 }
      );
    }

    // Check if user already exists
    const existing = users.find((u) => u.email === body.email);
    if (existing) {
      return HttpResponse.json(
        { detail: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Create user
    const newUser: MockUser = {
      id: nextId++,
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'BUYER',
      is_active: true,
      orders_count: 0,
    };
    users.push(newUser);

    const { password: _password, ...safeUser } = newUser;
    const token = generateToken();

    console.log('Mock Auth: Registered new user:', safeUser.email);

    return HttpResponse.json({
      user: safeUser,
      token: { access_token: token, token_type: 'bearer' },
    });
  }),

  // POST /api/v1/auth/login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { detail: 'Email и пароль обязательны' },
        { status: 422 }
      );
    }

    const user = users.find((u) => u.email === body.email);
    if (!user) {
      return HttpResponse.json(
        { detail: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    if (user.password !== body.password) {
      return HttpResponse.json(
        { detail: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const { password: _password, ...safeUser } = user;
    const token = generateToken();

    console.log('Mock Auth: User logged in:', safeUser.email);

    return HttpResponse.json({
      user: safeUser,
      token: { access_token: token, token_type: 'bearer' },
    });
  }),

  // GET /api/v1/users/me
  http.get('/api/v1/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { password: _password, ...safeUser } = users[0];

    return HttpResponse.json(safeUser);
  }),
];
