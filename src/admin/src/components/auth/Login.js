import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/authService';

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Define validation schema
  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    rememberMe: Yup.boolean()
  });

  // Handle login submission
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const { username, password, rememberMe } = values;
      const response = await authService.login(username, password, rememberMe);
      
      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again later.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="vertical-offset-100">
        <Col md={{ span: 4, offset: 4 }}>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          
          <Card className="login-panel">
            <Card.Header className="panel-login text-center">
              <h1 className="text-primary">Invoice Management System</h1>
            </Card.Header>
            
            <Card.Body>
              <Formik
                initialValues={{ username: '', password: '', rememberMe: false }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ 
                  values, 
                  errors, 
                  touched, 
                  handleChange, 
                  handleBlur, 
                  handleSubmit, 
                  isSubmitting 
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="bi bi-person"></i>
                          </span>
                        </div>
                        <Form.Control
                          type="text"
                          name="username"
                          placeholder="Enter Username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.username && errors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="bi bi-lock"></i>
                          </span>
                        </div>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Enter Password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="rememberMe"
                        label="Remember Me"
                        checked={values.rememberMe}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Button 
                      variant="danger" 
                      type="submit" 
                      className="w-100" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 