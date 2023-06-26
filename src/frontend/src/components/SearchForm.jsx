import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchForm = ({ onSearch }) => {
  const handleSearch = event => {
    event.preventDefault();
    const searchTerm = event.target.search.value;
    onSearch(searchTerm);
  };

  return (
       <Form style={{ display:"flex" }} onSubmit={handleSearch}>
      <Form.Group controlId="search">
        <Form.Control type="text" placeholder="Search" />
      </Form.Group>
      <Button style={{ marginLeft:"10px" }} variant="primary" type="submit">Search</Button>
    </Form>  
  );
};

export default SearchForm;
