import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Maintenance from '../Maintenance';
import { maintenanceAPI, vehicleAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';
jest.mock('../../utils/api', () => ({
  maintenanceAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vehicleAPI: {
    getAll: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
test('should fetch maintenance and vehicles on load', async () => {
  maintenanceAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.getAll.mockResolvedValue({ data: [] });

  render(<Maintenance />);

  await waitFor(() => {
    expect(maintenanceAPI.getAll).toHaveBeenCalled();
    expect(vehicleAPI.getAll).toHaveBeenCalled();
  });
});
test('should open add modal', async () => {
  maintenanceAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.getAll.mockResolvedValue({ data: [] });

  render(<Maintenance />);

});


test('should open add maintenance modal', async () => {
  maintenanceAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.getAll.mockResolvedValue({ data: [] });

  render(<Maintenance />);

  // Click button using role
  fireEvent.click(
    screen.getByRole('button', { name: /\+ log maintenance/i })
  );

  // Modal heading
  expect(
    screen.getByRole('heading', { name: /log maintenance/i })
  ).toBeInTheDocument();
});


test('should update maintenance record', async () => {
  maintenanceAPI.getAll.mockResolvedValue({
    data: [{
      _id: '1',
      description: 'Old',
      vehicle: { _id: '1', registrationNumber: 'ABC' },
      serviceDate: '2024-01-01',
      cost: 1000,
    }],
  });

  vehicleAPI.getAll.mockResolvedValue({ data: [] });

  maintenanceAPI.update.mockResolvedValue({});

  render(<Maintenance />);

  fireEvent.click(await screen.findByText('Edit'));

  fireEvent.change(screen.getByDisplayValue('Old'), {
    target: { value: 'Updated' },
  });

  fireEvent.click(screen.getByRole('button', { name: /update/i }));

  await waitFor(() => {
    expect(maintenanceAPI.update).toHaveBeenCalled();
  });
});


test('should delete record when confirmed', async () => {
  maintenanceAPI.getAll.mockResolvedValue({
    data: [{ _id: '1', description: 'Test' }],
  });

  vehicleAPI.getAll.mockResolvedValue({ data: [] });
  maintenanceAPI.delete.mockResolvedValue({});

  window.confirm = jest.fn(() => true);

  render(<Maintenance />);

  fireEvent.click(await screen.findByText('Del'));

  await waitFor(() => {
    expect(maintenanceAPI.delete).toHaveBeenCalledWith('1');
  });
});


test('should not delete if cancelled', async () => {
  maintenanceAPI.getAll.mockResolvedValue({
    data: [{ _id: '1', description: 'Test' }],
  });

  vehicleAPI.getAll.mockResolvedValue({ data: [] });

  window.confirm = jest.fn(() => false);

  render(<Maintenance />);

  fireEvent.click(await screen.findByText('Del'));

  expect(maintenanceAPI.delete).not.toHaveBeenCalled();
});
