import Image from "next/image";
import AddSample from "./pages/AddSample";
import SampleList from "./pages/SampleList";

export default function Home() {
  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-6">Garment Sample Tracking</h1>
    <AddSample />
    <h2 className="text-xl mt-6 mb-4">Sample List</h2>
    <SampleList />
  </div>
  );
}
