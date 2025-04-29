import UploadExcel from "./components/UploadExcel";
import AddSample from "./pages/AddSample";

export default function Home() {
  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-6">Garment Sample Tracking</h1>
    <UploadExcel/>
    <h2 className="text-xl mt-6 mb-4">Sample List</h2>
  </div>
  );
}
