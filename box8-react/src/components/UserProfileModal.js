import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

const UserProfileModal = ({ show, onHide, user, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (show) {
      loadUserFiles();
    }
  }, [show]);

  const loadUserFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/designer/get_user_files/', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        setError('Erreur lors du chargement des fichiers');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError('Erreur lors du chargement des fichiers');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.docx')) {
      setError('Seuls les fichiers PDF et DOCX sont acceptés');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/designer/upload_user_file/', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        await loadUserFiles();
        event.target.value = ''; // Réinitialiser l'input file
      } else {
        const data = await response.json();
        setError(data.detail || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      setError('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      const response = await fetch(`http://localhost:8000/designer/delete_user_file/${filename}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadUserFiles();
      } else {
        const data = await response.json();
        setError(data.detail || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        onLogout();
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Profil Utilisateur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-4">
          <h5>Informations utilisateur</h5>
          <div><strong>Nom d'utilisateur:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
        </div>

        <div className="mb-4">
          <h5>Mes fichiers</h5>
          <div className="d-flex align-items-center mb-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept=".pdf,.docx"
            />
            <Button 
              variant="outline-primary"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              <i className="bi bi-upload me-2"></i>
              {uploading ? 'Upload en cours...' : 'Upload un fichier'}
            </Button>
          </div>

          <ListGroup>
            {files.map((file) => (
              <ListGroup.Item 
                key={file.name}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div>{file.name}</div>
                  <small className="text-muted">
                    {formatFileSize(file.size)} • Modifié le {formatDate(file.modified)}
                  </small>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteFile(file.name)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </ListGroup.Item>
            ))}
            {files.length === 0 && (
              <ListGroup.Item className="text-center text-muted">
                Aucun fichier
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>

        <div className="d-grid">
          <Button variant="danger" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UserProfileModal;
