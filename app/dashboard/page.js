import DashboardClient from './DashboardClient'; // Assuming your Dashboard component is now named DashboardClient
import { toast } from "react-toastify";
import axios from "axios";

// Define your server-side fetch functions
const fetchSamplesServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples`);
    return res?.data?.samples || [];
  } catch (err) {
    console.error("Server Error: Failed to fetch samples", err);
    // On the server, you can log errors but can't directly show toast.
    // The client will get an empty array or handle null/undefined for this data.
    return [];
  }
};

const fetchTakenSamplesServer = async () => {
  try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/taken-samples`);
    return res?.data?.samples || [];
  } catch (err) {
    console.error("Server Error: Failed to fetch taken samples", err);
    return [];
  }
};

const fetchDeletedSamplesServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/deleted-samples`);
    return res?.data?.samples || [];
  } catch (err) {
    console.error("Server Error: Failed to fetch deleted samples", err);
    return [];
  }
};

const fetchCategoriesServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utilities/categories`);
    return res?.data?.data || [];
  } catch (err) {
    console.error("Server Error: Failed to fetch categories", err);
    return [];
  }
};

const fetchUsersServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`);
    return res?.data || [];
  } catch (err) {
    console.error("Server Error: Failed to fetch users", err);
    return [];
  }
};


export default async function DashboardPage() {
  // Fetch all data concurrently on the server
  const [
    samples,
    takenSamples,
    deletedSamples,
    categories,
    users
  ] = await Promise.all([
    fetchSamplesServer(),
    fetchTakenSamplesServer(),
    fetchDeletedSamplesServer(),
    fetchCategoriesServer(),
    fetchUsersServer()
  ]);

  return (
    <DashboardClient
      initialSamples={samples}
      initialTakenSamples={takenSamples}
      initialDeletedSamples={deletedSamples}
      initialCategories={categories}
      initialUsers={users}
    />
  );
}