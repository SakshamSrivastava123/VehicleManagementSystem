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