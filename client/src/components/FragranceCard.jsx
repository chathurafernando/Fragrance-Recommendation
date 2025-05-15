// src/components/FragranceCard.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

const FragranceCard = ({ image, name, description }) => {
  return (
    <Card style={{ width: '12rem' }} className="m-2 shadow-sm">
      <Card.Img variant="top" src={image} height={160} style={{ objectFit: 'cover' }} />
      <Card.Body>
        <Card.Title className="fs-6">{name}</Card.Title>
        <Card.Text className="text-muted small">
          {description?.substring(0, 50)}...
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FragranceCard;
