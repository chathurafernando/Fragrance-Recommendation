import React, { useState } from 'react';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import { useLocation } from "react-router-dom";

const CreateProduct = () => {

  const state = useLocation().state;

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('art');
  const [date, setDate] = useState('2025-03-10T05:00:00.000Z');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Dropzone hook for handling the file drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setErrors({});  // Clear errors when a file is selected
    },
  });

  // Validation Schema using Yup
  const validationSchema = Yup.object({
    image: Yup.mixed()
      .required('An image is required')
      .test('fileSize', 'File too large', (value) => value && value.size <= 5000000) // 5MB limit
      .test('fileType', 'Unsupported File Format', (value) =>
        value ? ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type) : true
      ),
    title: Yup.string().required('Title is required'),
    desc: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    date: Yup.date().required('Date is required').nullable(),
  });

  // Handle form submission
  const handleSubmit = async() => {
    const formData = {
      image: file,
      title,
      desc,
      category,
      date,
    };

    // const isValid = validationSchema.isValidSync(formData);

    // if (!isValid) {
    //   setErrors(validationSchema.validateSync(formData, { abortEarly: false }).inner.reduce((acc, err) => {
    //     acc[err.path] = err.message;
    //     return acc;
    //   }, {}));
    //   return;
    // }

    setSubmitted(true);
    console.log('Form Submitted', formData);

    await SaveProduct(state, formData);

  };

  const SaveProduct = async(state, formData) => {

    const url = state ? `/posts/${state.id}` : "/posts";

    if (state) {
      
      await axios.put(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Post updated successfully.");
    } else {
      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  }

  return (
    <div  className="content">
      <form>
        {/* Title Input */}
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
          />
          {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
        </div>

        {/* Description Input */}
        <div>
          <label>Description:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter description"
          />
          {errors.desc && <div style={{ color: 'red' }}>{errors.desc}</div>}
        </div>

        {/* Category Input */}
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="art">Art</option>
            <option value="tech">Tech</option>
            <option value="music">Music</option>
          </select>
          {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
        </div>

        {/* Date Input */}
        <div>
          <label>Date:</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <div style={{ color: 'red' }}>{errors.date}</div>}
        </div>

        {/* Image Upload */}
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            width: '300px',
            marginBottom: '10px',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <p>Drag and drop an image here, or click to select one</p>
        </div>
        {file && <p>File selected: {file.name}</p>}
        {errors.image && <div style={{ color: 'red' }}>{errors.image}</div>}

        {/* Submit Button */}
        <button type="button" onClick={handleSubmit} disabled={!file || !title || !desc || !category || !date}>
          Submit
        </button>
      </form>

      {submitted && <p>Form submitted successfully!</p>}
    </div>
  );
};

export default CreateProduct;
