'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('body');

export default function SampleList() {
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editedSample, setEditedSample] = useState({
    style: '',
    category: '',
    shelf: '',
    division: '',
  });
  console.log(samples);

  const fetchSamples = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/samples', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSamples(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const openEditModal = (sample) => {
    setSelectedSample(sample);
    setEditedSample({
      style: sample.style,
      category: sample.category,
      shelf: sample.s,
      division: sample.d,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSample(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedSample((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    try {
      await axios.put(`http://localhost:5000/api/samples/${selectedSample._id}`, editedSample, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      closeModal();
      fetchSamples();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this sample?')) {
      try {
        await axios.delete(`http://localhost:5000/api/samples/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchSamples();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Style</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Shelf</th>
            <th className="border p-2">Division</th>
            <th className="border p-2">Added By</th>
            <th className="border p-2">Updated By</th>
            <th className="border p-2">Deleted By</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            <tr key={index} className="text-center hover:bg-gray-50">
              <td className="border p-2">{sample.style}</td>
              <td className="border p-2">{sample.category}</td>
              <td className="border p-2">{sample.s}</td>
              <td className="border p-2">{sample.d}</td>
              <td className="border p-2">{sample.addedBy || 'N/A'}</td>
              <td className="border p-2">{sample.updatedBy || 'N/A'}</td>
              <td className="border p-2">{sample.deletedBy || 'N/A'}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => openEditModal(sample)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sample._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Editing */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Sample"
        className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl mb-4">Edit Sample</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm">Style:</label>
            <input
              type="text"
              name="style"
              value={editedSample.style}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Category:</label>
            <input
              type="text"
              name="category"
              value={editedSample.category}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Shelf:</label>
            <input
              type="text"
              name="shelf"
              value={editedSample.shelf}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Division:</label>
            <input
              type="text"
              name="division"
              value={editedSample.division}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
          </div>
        </form>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={saveChanges} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}
