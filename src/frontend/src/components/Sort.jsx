import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

const Sort = ({ onSort }) => {
const [sortDirection, setSortDirection] = useState('asc');

const handleSort = () => {
const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
setSortDirection(newSortDirection);
onSort('title', newSortDirection);
};

return (
<div>
<Button onClick={handleSort}>Sort</Button>
</div>
);
};

export default Sort;
