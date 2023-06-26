import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal } from 'react-bootstrap';
import SearchForm from './SearchForm';
import CategoryFilter from './CategoryFilter';
import PaginationComponent from './Pagination';
import PostForm from './PostForm';
import Sort from './Sort';

const PostList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const postsPerPage = 12;
  const [currentPost, setCurrentPost] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/posts');
      const data = await response.json();
      setPosts(data);
      const categories = data.reduce((acc, post) => {
        post.categories.forEach((category) => {
          if (!acc.includes(category)) acc.push(category);
        });
        return acc;
      }, []);
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const updatePost = async (post) => {
    console.log(post);

    try {
      await fetch(`http://localhost:8000/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });
      fetchPosts();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const deletePost = async (id) => {
    try {
      await fetch(`http://localhost:8000/posts/${id}`, { method: 'DELETE' });
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSort = (key, direction) => {
    setSortDirection(direction);
  };
  const searchPosts = () => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const searchedPosts = searchPosts();
  const sortPosts = () => {
    return searchedPosts.sort((a, b) => {
      if (a.title < b.title) return sortDirection === 'asc' ? -1 : 1;
      if (a.title > b.title) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  

  const filterPostsByCategory = () => {
    if (!categoryFilter) return searchedPosts;
    return searchedPosts.filter((post) =>
      post.categories.includes(categoryFilter)
    );
  };

  const handleCategoryFilterChange = (event) => {
    const selectedCategory = event.target.value;
    setCategoryFilter(selectedCategory);
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const totalPages = Math.ceil(
    (categoryFilter ? filterPostsByCategory().length : sortPosts().length) /
      postsPerPage
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  
  const currentPosts = categoryFilter
  ? filterPostsByCategory().slice(indexOfFirstPost, indexOfLastPost)
  : sortPosts().slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="d-flex justify-content-center vh-100">
      <div style={{ width: '100%', backgroundColor: 'transparent' }}>
        <div
          className="mb-3 mt-3"
          style={{
            display: 'flex',
            backgroundColor: 'transparent',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <SearchForm onSearch={handleSearch} />
          <CategoryFilter
            categories={categories}
            onFilter={handleCategoryFilterChange}
          />
          <Sort onSort={handleSort} />
        </div>
        <Row>
          {currentPosts.map((post) => (
            <Col key={post.id} sm={4} className="mb-3">
              <Card
                className="form"
                style={{ backgroundColor: 'transparent', overflow: 'auto' }}
              >
                <Card.Body>
                  {post.description.photo && (
                    <img src={post.description.photo} alt="Post" />
                  )}
                  <Card.Title>
                    <a
                      className="title"
                      href={post.description.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {post.title}
                    </a>
                  </Card.Title>
                  {post.description.link && (
                    <a
                      className="link"
                      href={post.description.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read more...
                    </a>
                  )}
                  <Button
                    style={{ marginTop: '10px', marginLeft: '130px', marginRight: '10px' }}
                    variant="primary"
                    onClick={() => {
                      setCurrentPost(post);
                      setShowModal(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    style={{ marginTop: '10px' }}
                    variant="danger"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <PaginationComponent
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={handlePageChange}
        />
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPost && <PostForm post={currentPost} onSubmit={updatePost} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PostList;
