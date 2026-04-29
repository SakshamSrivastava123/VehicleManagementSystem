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