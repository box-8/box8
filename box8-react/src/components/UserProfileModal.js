import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import 'bootstrap-icons/font/bootstrap-icons.css';
import config from '../config';

const UserProfileModal = ({ show, onHide, user, onLogout, onLLMChange }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedLLM, setSelectedLLM] = useState('openai');
  const [llmConfigs, setLLMConfigs] = useState({});
  const [users, setUsers] = useState([]);
  const [summarizingFiles, setSummarizingFiles] = useState(new Set());
  const fileInputRef = useRef();

  const getFileUrl = (fileName) => {
    return `${config.API_URL}/designer/get_user_file/${encodeURIComponent(fileName)}`;
  };

  const handleLLMChange = async (llm) => {
    try {
      const response = await fetch(`${config.API_URL}/designer/set-llm`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ llm }),
      });

      if (response.ok) {
        setSelectedLLM(llm);
        onLLMChange(llm); // Mettre à jour le LLM dans App.js
      }
    } catch (error) {
      console.error('Error setting LLM:', error);
    }
  };

  useEffect(() => {
    if (show) {
      loadUserFiles();
      const fetchLLMConfigs = async () => {
        try {
          const response = await fetch(`${config.API_URL}/designer/get-llms`, {
            credentials: 'include' // Important pour recevoir les cookies
          });
          const data = await response.json();
          setLLMConfigs(data.configs);
          setSelectedLLM(data.current); // Utiliser la valeur du cookie
        } catch (error) {
          console.error('Error fetching LLM configs:', error);
        }
      };
      fetchLLMConfigs();
    }
  }, [show]);

  const loadUserFiles = async () => {
    try {
      const response = await fetch(`${config.API_URL}/designer/get_user_files`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Vérifier les résumés existants pour chaque fichier
        const filesWithSummaryStatus = await Promise.all(data.map(async (file) => {
          const summaryResponse = await fetch(`${config.API_URL}/designer/get_summary_file/${encodeURIComponent(file.name)}`, {
            credentials: 'include'
          });
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            return { ...file, has_summary: summaryData.has_summary };
          }
          return { ...file, has_summary: false };
        }));
        setFiles(filesWithSummaryStatus);
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
      const response = await fetch(`${config.API_URL}/designer/upload_user_file/`, {
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
      const response = await fetch(`${config.API_URL}/designer/delete_user_file/${filename}`, {
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
      const response = await fetch(`${config.API_URL}/auth/logout/`, {
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

  // Fonction pour charger la liste des utilisateurs
  const loadUsers = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/admin/users`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Charger les utilisateurs quand l'onglet admin est sélectionné
  useEffect(() => {
    if (show && activeTab === 'admin' && user?.is_admin) {
      loadUsers();
    }
  }, [show, activeTab]);

  const handleToggleAdmin = async (userId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        loadUsers();
      } else {
        setError('Erreur lors de la modification du statut admin');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/admin/users/${userId}/toggle-active`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        loadUsers();
      } else {
        setError('Erreur lors de la modification du statut actif');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(`${config.API_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          loadUsers();
        } else {
          setError('Erreur lors de la suppression de l\'utilisateur');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
      }
    }
  };

  const handleSummarize = async (fileName) => {
    setSummarizingFiles(prev => new Set([...prev, fileName]));
    setError('');
    try {
      const response = await fetch(`${config.API_URL}/designer/summarize_file/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Afficher le résumé dans ResponseModal via App.js
        const event = new CustomEvent('showResponse', { 
          detail: { 
            title: `Résumé de ${fileName}`,
            content: data.summary 
          }
        });
        window.dispatchEvent(event);
        // Recharger la liste des fichiers pour mettre à jour les statuts des résumés
        await loadUserFiles();
      } else {
        setError('Erreur lors de la génération du résumé');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setSummarizingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const handleViewSummary = async (fileName) => {
    try {
      const response = await fetch(`${config.API_URL}/designer/get_summary_file/${encodeURIComponent(fileName)}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_summary) {
          const event = new CustomEvent('showResponse', { 
            detail: { 
              title: `Résumé existant de ${fileName}`,
              content: data.summary 
            }
          });
          window.dispatchEvent(event);
        } else {
          setError('Aucun résumé disponible pour ce fichier');
        }
      } else {
        setError('Erreur lors de la récupération du résumé');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Profil Utilisateur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          {/* Profile Tab */}
          <Tab eventKey="profile" title="Profile">
            <div className="user-profile-section">
              <h4>Informations du profil</h4>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Nom d'utilisateur:</strong> {user?.username}</p>

            </div>
            <Button variant="danger" onClick={handleLogout}>
          Se déconnecter
        </Button>
          </Tab>

          {/* Files Tab */}
          <Tab eventKey="files" title="Fichiers">
            <div className="files-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Mes fichiers</h4>
                <Button
                  variant="outline-primary"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  <i className="bi bi-upload me-2"></i>
                  {uploading ? 'Upload en cours...' : 'Upload un fichier'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx"
                />
              </div>

              <ListGroup style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid rgba(0,0,0,.125)', borderRadius: '0.375rem' }}>
                {files.map((file) => (
                  <ListGroup.Item 
                    key={file.name}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="d-flex align-items-center">
                        <span>{file.name}</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="ms-2 p-0"
                          onClick={() => window.open(getFileUrl(file.name), '_blank')}
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </Button>
                      </div>
                      <small className="text-muted">
                        {formatFileSize(file.size)} • Modifié le {formatDate(file.modified)}
                      </small>
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSummarize(file.name)}
                        disabled={summarizingFiles.has(file.name)}
                      >
                        {summarizingFiles.has(file.name) ? (
                          <>
                            <i className="bi bi-hourglass-split me-1"></i>
                            Résumé en cours...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-file-text me-1"></i>
                            Résumer
                          </>
                        )}
                      </Button>
                      {file.has_summary && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewSummary(file.name)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Voir résumé
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteFile(file.name)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
                {files.length === 0 && (
                  <ListGroup.Item className="text-center text-muted">
                    Aucun fichier
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          </Tab>

          {/* AI Tab */}
          <Tab eventKey="ai" title="AI">
            <div className="ai-settings-section">
              <h4>Configuration LLM</h4>
              <Form>
                <Form.Group>
                  {Object.entries(llmConfigs).map(([key, config]) => (
                    <Form.Check
                      key={key}
                      type="radio"
                      id={`llm-${key}`}
                      name="llm"
                      label={config.label}
                      checked={selectedLLM === key}
                      onChange={() => handleLLMChange(key)}
                    />
                  ))}
                </Form.Group>
              </Form>
            </div>
          </Tab>

          {/* Admin Tab */}
          {user?.is_admin && (
            <Tab eventKey="admin" title="Administration">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <Button
                          variant={u.is_active ? "success" : "secondary"}
                          size="sm"
                          onClick={() => handleToggleActive(u.id)}
                          disabled={u.id === user.id}
                        >
                          {u.is_active ? "Actif" : "Inactif"}
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant={u.is_admin ? "warning" : "secondary"}
                          size="sm"
                          onClick={() => handleToggleAdmin(u.id)}
                          disabled={u.id === user.id}
                        >
                          {u.is_admin ? "Admin" : "Utilisateur"}
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserProfileModal;
