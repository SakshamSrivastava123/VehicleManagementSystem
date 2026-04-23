import { vehicleAPI, driverAPI, tripAPI, maintenanceAPI } from '../../utils/api';
import { render, screen } from '@testing-library/react';
import Vehicles from '../Vehicles';
jest.mock('../../utils/api', () => ({
  vehicleAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  driverAPI: {
    getAll: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

it.only('fetches and displays vehicles on load', async () => {
  vehicleAPI.getAll.mockResolvedValue({ data: [{ _id: '1', registrationNumber: 'MH01', make: 'Toyota', model: 'Camry' }] });
  driverAPI.getAll.mockResolvedValue({ data: [] });

  render(<Vehicles />);

//   expect(await screen.findByText('MH01')).toBeInTheDocument();
});

it('shows loading initially', () => {
  render(<Vehicles />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

it('shows empty state when no vehicles', async () => {
  vehicleAPI.getAll.mockResolvedValue({ data: [] });
  driverAPI.getAll.mockResolvedValue({ data: [] });

  render(<Vehicles />);

  expect(await screen.findByText(/No vehicles found/i)).toBeInTheDocument();
});

it('calls API when search changes', async () => {
  vehicleAPI.getAll.mockResolvedValue({ data: [] });
  driverAPI.getAll.mockResolvedValue({ data: [] });

  render(<Vehicles />);

  fireEvent.change(screen.getByPlaceholderText(/Search/i), {
    target: { value: 'Toyota' },
  });

  await waitFor(() => {
    expect(vehicleAPI.getAll).toHaveBeenCalled();
  });
});

it('opens add vehicle modal', () => {
  render(<Vehicles />);
  fireEvent.click(screen.getByText('+ Add Vehicle'));

  expect(screen.getByText(/Add Vehicle/i)).toBeInTheDocument();
});

it('shows empty state when no vehicles', async () => {
  vehicleAPI.getAll.mockResolvedValue({ data: [] });
  driverAPI.getAll.mockResolvedValue({ data: [] });

  render(<Vehicles />);

  expect(await screen.findByText(/No vehicles found/i)).toBeInTheDocument();
});

it('edits a vehicle', async () => {
  const vehicle = { _id: '1', registrationNumber: 'MH01', make: 'Toyota', model: 'Camry' };

  vehicleAPI.getAll.mockResolvedValue({ data: [vehicle] });
  driverAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.update.mockResolvedValue({});

  render(<Vehicles />);

  fireEvent.click(await screen.findByText('Edit'));

  fireEvent.submit(screen.getByRole('button', { name: /Update/i }));

  await waitFor(() => {
    expect(vehicleAPI.update).toHaveBeenCalledWith('1', expect.any(Object));
  });
});


it('deletes a vehicle', async () => {
  window.confirm = jest.fn(() => true);

  const vehicle = { _id: '1', registrationNumber: 'MH01' };

  vehicleAPI.getAll.mockResolvedValue({ data: [vehicle] });
  driverAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.delete.mockResolvedValue({});

  render(<Vehicles />);

  fireEvent.click(await screen.findByText('Del'));

  await waitFor(() => {
    expect(vehicleAPI.delete).toHaveBeenCalledWith('1');
  });
});

it('does not delete if user cancels', async () => {
  window.confirm = jest.fn(() => false);

  render(<Vehicles />);
  fireEvent.click(await screen.findByText('Del'));

  expect(vehicleAPI.delete).not.toHaveBeenCalled();
});

it('shows error toast on API failure', async () => {
  vehicleAPI.getAll.mockRejectedValue({});

  render(<Vehicles />);

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalled();
  });
});