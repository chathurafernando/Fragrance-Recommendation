import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddAdvertisementForm = () => {
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [placementsList, setPlacementsList] = useState([]);  // For dropdown
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // ✅ Hook
  // ✅ Load placement options (pricing & placement dropdown)
  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await axios.get('/advertisement');  // Your endpoint to fetch placements
        setPlacementsList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlacements();
  }, []);

  // ✅ On Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!bannerFile) {
    setError('Please upload a banner image!');
    return;
  }

  try {
    setError('');
    setMessage('');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    if (!userId) {
      setError('User not logged in!');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('description', description);
    formData.append('placement', placement);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('banner', bannerFile);

    // Post the new advertisement
    const res = await axios.post(`/advertisement/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setMessage(res.data.message);
    setDescription('');
    setPlacement('');
    setStartDate('');
    setEndDate('');
    setBannerFile(null);

    // Find the selected placement object to get id and price
localStorage.setItem('ad_payment_info', JSON.stringify({ 
  advertisementId: res.data.id, 
  price: res.data.price 
}));



    // Redirect to payment page
    navigate(`/vendor/payment`);

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || 'Failed to add advertisement');
  }
};


  return (
    <div className="container mt-4">
      <h2>Add Advertisement Offer</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Placement */}
        <div className="mb-3">
          <label className="form-label">Placement</label>
          <select
            className="form-select"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            required
          >
            <option value="">Select placement</option>
            {placementsList.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} - ${p.price}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* End Date */}
        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Banner Upload */}
        <div className="mb-3">
          <label className="form-label">Banner Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setBannerFile(e.target.files[0])}
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary">Add Advertisement</button>

      </form>
    </div>
  );
};

export default AddAdvertisementForm;
