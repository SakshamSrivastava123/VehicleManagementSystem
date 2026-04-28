import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { useAuth } from '../../context/AuthContext';
import '@testing-library/jest-dom';
// mock navigate
const mockNavigate = jest.fn();

// mock auth
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

test('should login successfully', async () => {
  mockLogin.mockResolvedValue({});

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@mail.com' },
  });

  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: '123456' },
  });

  const buttons = screen.getAllByRole('button', { name: /sign in/i });

// click submit button (usually second)
fireEvent.click(buttons[1]);

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@mail.com', '123456');
  });

  expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('should switch to register mode', () => {
  render(<Login />);

  fireEvent.click(screen.getByText('Register'));

  expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
});


test('should register successfully', async () => {
  mockRegister.mockResolvedValue({});

  render(<Login />);

  // switch to register
  fireEvent.click(screen.getByText('Register'));

  fireEvent.change(screen.getByPlaceholderText('John Doe'), {
    target: { value: 'Saksham' },
  });

  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@mail.com' },
  });

  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: '123456' },
  });

  fireEvent.change(screen.getByDisplayValue('Manager'), {
    target: { value: 'admin' },
  });

  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalledWith(
      'Saksham',
      'test@mail.com',
      '123456',
      'admin'
    );
  });

  expect(mockNavigate).toHaveBeenCalledWith('/');
});

import { toast } from 'react-toastify';

test('should show error on login failure', async () => {
  mockLogin.mockRejectedValue({
    response: { data: { message: 'Invalid credentials' } },
  });

  render(<Login />);

  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'wrong@mail.com' },
  });

  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: 'wrong' },
  });

 const buttons = screen.getAllByRole('button', { name: /sign in/i });

// index 1 = submit button
fireEvent.click(buttons[1]);

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
  });
});
