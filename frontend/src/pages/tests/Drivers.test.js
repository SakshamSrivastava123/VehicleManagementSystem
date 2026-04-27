import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Drivers from '../Drivers';
import { driverAPI } from   '../../utils/api';
import '@testing-library/jest-dom';

jest.mock('../../utils/api');

test('fetches and displays drivers', async () => {
  driverAPI.getAll.mockResolvedValue({
    data: [{ _id: '1', name: 'John Doe', phone: '123', email: 'a@test.com' }]
  });

  render(<Drivers />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});