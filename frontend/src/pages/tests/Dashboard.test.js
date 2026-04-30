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

test('should render dashboard stats correctly', async () => {
  vehicleAPI.getStats.mockResolvedValue({
    data: { total: 10, active: 8, maintenance: 2, inactive: 2 },
  });

  driverAPI.getStats.mockResolvedValue({
    data: { total: 5, available: 3, onTrip: 2, offDuty: 1 },
  });

  tripAPI.getStats.mockResolvedValue({
    data: { total: 20, completed: 15, totalDistance: 1000, totalFuelCost: 5000 },
  });

  tripAPI.getAll.mockResolvedValue({
    data: [],
  });

  maintenanceAPI.getAll.mockResolvedValue({
    data: [],
  });

  render(<Dashboard />);

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  expect(screen.getByText('10')).toBeInTheDocument(); // vehicles
  expect(screen.getByText('5')).toBeInTheDocument();  // drivers
  expect(screen.getByText('20')).toBeInTheDocument(); // trips
});