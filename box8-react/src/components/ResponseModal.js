import React, { useEffect, useState } from 'react';
import { Modal, Button, Collapse } from 'react-bootstrap';
import { marked } from 'marked';
import { downloadAsWord } from '../utils/documentUtils';
import '../styles/markdown.css';

const ResponseModal = ({ show, handleClose, message, title, backstories = [], diagramName = 'response' }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [showBackstories, setShowBackstories] = useState(false);

  const parseMarkdownTable = (tableContent) => {
    const lines = tableContent.trim().split('\n');
    if (lines.length < 3) return null;

    // Extraire l'en-tête
    const headerCells = lines[0]
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());

    // Extraire les lignes de données (ignorer la ligne de séparation)
    const rows = lines.slice(2).map(line => 
      line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim())
    );

    return { headerCells, rows };
  };

  const convertTableToHtml = (tableContent) => {
    const table = parseMarkdownTable(tableContent);
    if (!table) return tableContent;

    return `
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              ${table.headerCells.map(cell => `<th>${cell}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const processMarkdown = (content) => {
    if (!content) return '';

    // Configuration de marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      tables: true,
      headerIds: false,
      mangle: false,
      pedantic: false,
      sanitize: false
    });

    // Configurer le renderer pour gérer les barres de progression
    const renderer = new marked.Renderer();
    const defaultImageRenderer = renderer.image.bind(renderer);
    renderer.image = (href, title, text) => {
      if (text === 'Progress' && href.startsWith('https://progress-bar.dev/')) {
        const percentage = href.split('/').pop();
        return `
          <div class="progress" style="height: 20px;">
            <div 
              class="progress-bar" 
              role="progressbar" 
              style="width: ${percentage}%;" 
              aria-valuenow="${percentage}" 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              ${percentage}%</div>
          </div>
        `;
      }
      return defaultImageRenderer(href, title, text);
    };

    // Première passe : convertir le markdown en HTML
    let processedContent = marked(content, { renderer });

    // Deuxième passe : extraire et convertir les tables des blocs de code
    processedContent = processedContent.replace(
      /<pre><code(?:\s+class=".*?")?>([^]*?)<\/code><\/pre>/g,
      (match, codeContent) => {
        if (codeContent.includes('|')) {
          const tableMatch = codeContent.match(/\|[\s\S]*?\n[\s\S]*?\|[\s\S]*?(?=\n\n|$)/g);
          if (tableMatch) {
            return convertTableToHtml(tableMatch[0]);
          }
        }
        return match;
      }
    );

    // Troisième passe : convertir les tables standalone
    processedContent = processedContent.replace(
      /(?:^|\n)((?:\|[^\n]*\|\n){3,})(?:\n|$)/gm,
      (match, tableContent) => {
        return convertTableToHtml(tableContent);
      }
    );

    return processedContent;
  };

  useEffect(() => {
    if (show && message) {
      try {
        const processedContent = processMarkdown(message);
        setHtmlContent(processedContent);
      } catch (error) {
        console.error('Erreur lors du parsing markdown:', error);
        setHtmlContent(message);
      }
    }
  }, [show, message]);

  // Fonction pour télécharger le contenu en Word
  const handleDownload = () => {
    if (message) {
      const fileName = `${diagramName.replace(/\.json$/, '')}-response`;
      downloadAsWord(message, fileName);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Réponse'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        {backstories && backstories.length > 0 && (
          <div className="mt-4">
            <Button
              onClick={() => setShowBackstories(!showBackstories)}
              variant="outline-secondary"
              className="mb-2"
              aria-controls="backstories-collapse"
              aria-expanded={showBackstories}
            >
              {showBackstories ? 'Masquer les détails' : 'Voir plus'}
            </Button>
            <Collapse in={showBackstories}>
              <div id="backstories-collapse">
                <div className="card card-body">
                  <h5>Backstories des agents</h5>
                  {backstories.map((backstory, index) => (
                    <div key={index} className="mb-3">
                      <h6>{backstory.name}</h6>
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: processMarkdown(backstory.backstory) 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Collapse>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={handleDownload}
          disabled={!message}
        >
          Download as Word
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResponseModal;
