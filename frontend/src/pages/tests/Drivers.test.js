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


describe('Add Driver - Unit Test', () => {

  beforeEach(() => {
    driverAPI.getAll.mockResolvedValue({ data: [] });
  });

  test('should add driver successfully with valid input', async () => {
    driverAPI.create.mockResolvedValue({});

    render(<Drivers />);

    // 👉 Open Add Driver Modal
    fireEvent.click(screen.getByText('+ Add Driver'));

    // 👉 Fill form fields
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Saksham' },
    });

    fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
      target: { value: 'saksham@test.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('+91 9876543210'), {
      target: { value: '9876543210' },
    });

    fireEvent.change(screen.getByPlaceholderText('MH0120230001'), {
      target: { value: 'LIC123456' },
    });

    // fireEvent.change(screen.getByLabelText(/license expiry/i), {
    //   target: { value: '2030-12-31' },
    // });

    // 👉 Click submit (avoid duplicate button issue)
    const submitBtn = screen.getAllByRole('button', {
      name: /add driver/i,
    })[1];

    fireEvent.click(submitBtn);

    // 👉 Assert API called
    await waitFor(() => {
      expect(driverAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Saksham',
          email: 'saksham@test.com',
          phone: '9876543210',
          licenseNumber: 'LIC123456',
        })
      );
    });
  });


  test('should delete driver when confirmed', async () => {
  driverAPI.getAll.mockResolvedValue({
    data: [{ _id: '1', name: 'John Doe', phone: '123', email: 'a@test.com' }]
  });

  driverAPI.delete.mockResolvedValue({});

  // mock confirm = true
  window.confirm = jest.fn(() => true);

  render(<Drivers />);

  // wait for row
  await screen.findByText('John Doe');

  // click delete
  fireEvent.click(screen.getByText('Del'));

  await waitFor(() => {
    expect(driverAPI.delete).toHaveBeenCalledWith('1');
  });
});

test('should not delete driver if cancelled', async () => {
  driverAPI.getAll.mockResolvedValue({
    data: [{ _id: '1', name: 'John Doe' }]
  });

  window.confirm = jest.fn(() => false);

  render(<Drivers />);

  await screen.findByText('John Doe');

  fireEvent.click(screen.getByText('Del'));

  expect(driverAPI.delete).not.toHaveBeenCalled();
});

});