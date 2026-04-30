import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { vehicleAPI, driverAPI, tripAPI, maintenanceAPI } from '../../utils/api';
import '@testing-library/jest-dom';

jest.mock('../../utils/api', () => ({
  vehicleAPI: { getStats: jest.fn() },
  driverAPI: { getStats: jest.fn() },
  tripAPI: {
    getStats: jest.fn(),
    getAll: jest.fn(),
  },
  maintenanceAPI: { getAll: jest.fn() },
}));

test('should show loading initially', () => {
  vehicleAPI.getStats.mockReturnValue(new Promise(() => {}));

  render(<Dashboard />);

  expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
});