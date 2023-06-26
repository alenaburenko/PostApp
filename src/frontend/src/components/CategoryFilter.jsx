import React from 'react';
import { Form } from 'react-bootstrap';

const CategoryFilter = ({ categories, onFilter }) => {
  const handleFilterChange = event => {
    onFilter(event); 
  };

  return (
    <Form.Control as="select" onChange={handleFilterChange} style={{ width: "50%", backgroundColor: "transparent"}}>
      <option value="">All categories</option>
      {categories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </Form.Control>
  );
};

export default CategoryFilter;
