import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Maintenance from '../Maintenance';
import { maintenanceAPI, vehicleAPI } from '../../utils/api';
import { toast } from 'react-toastify';

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
