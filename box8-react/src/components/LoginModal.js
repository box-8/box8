import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import config from '../config';

const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        onLoginSuccess(data);
        onHide();
      } else {
        setError(data.detail || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation côté client
    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    if (formData.username.length < 3 || !/^[a-zA-Z0-9]+$/.test(formData.username)) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères et uniquement des lettres et des chiffres.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        setIsLoginMode(true);
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: ''
        }));
        setError('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      } else {
        setError(data.detail || 'Erreur lors de l\'inscription.');
      }
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      confirm_password: ''
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isLoginMode ? 'Connexion' : 'Inscription'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant={error.includes('succès') ? 'success' : 'danger'}>
            {error}
          </Alert>
        )}
        <Form onSubmit={isLoginMode ? handleLogin : handleSignup}>
          {!isLoginMode && (
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choisissez un nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                pattern="[A-Za-z0-9]+"
              />
              <Form.Text className="text-muted">
                Minimum 3 caractères, uniquement lettres et chiffres
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Entrez votre email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder={isLoginMode ? "Entrez votre mot de passe" : "Choisissez un mot de passe"}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={isLoginMode ? 1 : 8}
            />
            {!isLoginMode && (
              <Form.Text className="text-muted">
                Minimum 8 caractères
              </Form.Text>
            )}
          </Form.Group>

          {!isLoginMode && (
            <Form.Group className="mb-3">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                isLoginMode ? 'Connexion en cours...' : 'Inscription en cours...'
              ) : (
                isLoginMode ? 'Se connecter' : 'S\'inscrire'
              )}
            </Button>
          </div>
        </Form>
        <div className="text-center mt-3">
          <p className="mb-0">
            {isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
          </p>
          <Button
            variant="link"
            onClick={toggleMode}
            className="p-0"
          >
            {isLoginMode ? 'Créer un compte' : 'Se connecter'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
