import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Card, Form, Button, Tab, Tabs } from "react-bootstrap";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
    return usernameRegex.test(username);
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!validateEmail(email)) {
      errors.email = "Invalid email address";
    }
    if (!validatePassword(password)) {
      errors.password = "Password must be at least 8 characters";
    }
    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      onLogin();
      navigate('/');      
    } catch (error) {
      console.log(error)
    }
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!validateUsername(username)) {
      errors.username = "Username must be between 3 and 16 characters";
    }
    if (!validateEmail(email)) {
      errors.email = "Invalid email address";
    }
    if (!validatePassword(password)) {
      errors.password = "Password must be at least 8 characters";
    }
    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      await axios.post('http://localhost:8000/register', { username, email, password });
      setActiveTab("login");
    } catch (error) {
      console.log(error)
    }
  };
  

  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 sm form" style={{ width: "50%", height: "73%", backgroundColor: "transparent" }} text="dark">
        <Tabs activeKey={activeTab} onSelect={setActiveTab} id="login-register-tabs">
          <Tab eventKey="login" title="Login">
            <h2 className="p-4">Login</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  isInvalid={errors.email}
                />
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPasswordLogin">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  isInvalid={errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3 form__submit-btn">
                Sign In
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Register">
            <h2 className="p-4">Register</h2>
            <Form onSubmit={handleRegister}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  isInvalid={errors.username}
                />
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEmailRegistration">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  isInvalid={errors.email}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  isInvalid={errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3 form__submit-btn">
                Register
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
