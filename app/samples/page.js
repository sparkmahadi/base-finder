// app/components/SampleList.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SampleList() {
  const [samples, setSamples] = useState([]);
  console.log(samples.data);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/samples')
      .then((res) => setSamples(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-4">
      {samples.map((sample, index) => (
        <div key={index} className="border p-4">
          <p><strong>Style:</strong> {sample.style}</p>
          <p><strong>Category:</strong> {sample.category}</p>
          <p><strong>Shelf:</strong> {sample.shelf}</p>
          <p><strong>Box:</strong> {sample.box}</p>
        </div>
      ))}
    </div>
  );
}
