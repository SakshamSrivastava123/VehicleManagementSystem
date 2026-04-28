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