// src/components/SectionTitle.jsx
import React from 'react';

const SectionTitle = ({ title, icon }) => (
  <h5 className="mt-4 mb-3">
    {icon && <span className="me-2">{icon}</span>}
    {title}
  </h5>
);

export default SectionTitle;
