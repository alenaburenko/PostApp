import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const PostForm = ({ post, onSubmit }) => {
  const navigate = useNavigate();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (post) {
      const title = event.target.formTitle.value;
      const link = event.target.formLink.value;
      const categories = event.target.formCategory.value.split(',');
      const descriptionXml = `<img class="type:primaryImage" src="${post.description.photo}" /><p>${post.description.text}</p><p><a href="${post.link}">Read more...</a></p>`;
      onSubmit({
        ...post,
        title,
        description:descriptionXml,
        link,
        categories
      });
    } else {
      const title = event.target.formTitle.value;
      const description = event.target.formDescription.value;
      const link = event.target.formLink.value;
      const categories = event.target.formCategory.value.split(',');
      
      fetch('http://localhost:8000/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, link, categories })
      }).then(() => {
        event.target.reset();
        navigate('/');    
      });
    }
  
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="p-4 form" style={{ width: "50%", height: "70%", backgroundColor: "transparent" }} text="dark">
        <h2>{post ? 'Edit Post' : 'Create Post'}</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Label required type="text" className="mt-3">Title</Form.Label>
            <Form.Control type="text" placeholder="Enter title" defaultValue={post?.title} />
          </Form.Group>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={5} placeholder="Please insert a picture using the `img` tag and text using the `p` tag." defaultValue={post? `${post.description.photo}\n${post.description.text}` : null}  />
          </Form.Group>
          <Form.Group controlId="formLink">
            <Form.Label>Link</Form.Label>
            <Form.Control type="text" placeholder="Enter link" defaultValue={post?.link} />
          </Form.Group>
          <Form.Group controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" placeholder="Enter categories separated by commas" defaultValue={post?.categories && post.categories.join(',')} />
          </Form.Group>
          <Button className="mt-3 form__submit-btn" variant="primary" type="submit">Submit</Button>
        </Form>
      </div>
    </div>
  );
};

export default PostForm;
