import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Trips from "../Trips";
import { tripAPI, vehicleAPI, driverAPI } from  '../../utils/api';
import { toast } from "react-toastify";
import "@testing-library/jest-dom";

jest.mock("../../utils/api");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const mockTrips = [
  {
    _id: "1",
    startLocation: "Delhi",
    endLocation: "Noida",
    vehicle: { registrationNumber: "DL01AB1234" },
    driver: { name: "John" },
    status: "scheduled",
  },
];

const mockVehicles = [{ _id: "v1", registrationNumber: "DL01AB1234", make: "Toyota", model: "Camry" }];
const mockDrivers = [{ _id: "d1", name: "John", licenseNumber: "LIC123" }];
it("fetches trips on mount", async () => {
  tripAPI.getAll.mockResolvedValue({ data: mockTrips });
  vehicleAPI.getAll.mockResolvedValue({ data: mockVehicles });
  driverAPI.getAll.mockResolvedValue({ data: mockDrivers });

  render(<Trips />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(tripAPI.getAll).toHaveBeenCalled();
  });

});

it("shows error when fetch fails", async () => {
  tripAPI.getAll.mockRejectedValue(new Error("fail"));
  vehicleAPI.getAll.mockResolvedValue({ data: [] });
  driverAPI.getAll.mockResolvedValue({ data: [] });

  render(<Trips />);

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Failed to fetch");
  });
});



it("opens add modal", async () => {
  tripAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.getAll.mockResolvedValue({ data: mockVehicles });
  driverAPI.getAll.mockResolvedValue({ data: mockDrivers });

  render(<Trips />);

  await waitFor(() => screen.getByText("+ Add Trip"));

  fireEvent.click(screen.getByText("+ Add Trip"));

  expect(screen.getByText("📍 Add Trip")).toBeInTheDocument();
});

it("creates a new trip", async () => {
  tripAPI.getAll.mockResolvedValue({ data: [] });
  vehicleAPI.getAll.mockResolvedValue({ data: mockVehicles });
  driverAPI.getAll.mockResolvedValue({ data: mockDrivers });
  tripAPI.create.mockResolvedValue({});

  render(<Trips />);

  await waitFor(() => screen.getByText("+ Add Trip"));

  fireEvent.click(screen.getByText("+ Add Trip"));

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[0], { target: { value: "v1" } });
  fireEvent.change(selects[1], { target: { value: "d1" } });

  fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
    target: { value: "Delhi" },
  });

  fireEvent.change(screen.getByPlaceholderText("Pune"), {
    target: { value: "Noida" },
  });

 
  const buttons = screen.getAllByRole("button", { name: /add trip/i });


fireEvent.click(buttons[1]); // open modal

  await waitFor(() => {
    expect(tripAPI.create).toHaveBeenCalled();
  });
});

it("opens edit modal and updates trip", async () => {
  tripAPI.getAll.mockResolvedValue({ data: mockTrips });
  vehicleAPI.getAll.mockResolvedValue({ data: mockVehicles });
  driverAPI.getAll.mockResolvedValue({ data: mockDrivers });
  tripAPI.update.mockResolvedValue({});

  render(<Trips />);

  await waitFor(() => screen.getByText("Delhi"));

  fireEvent.click(screen.getByText("Edit"));

  expect(screen.getByText("✏️ Edit Trip")).toBeInTheDocument();

  fireEvent.submit(screen.getByRole("button", { name: /Update/i }));

  await waitFor(() => {
    expect(tripAPI.update).toHaveBeenCalled();
  });
});