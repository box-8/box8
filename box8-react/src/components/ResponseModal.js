import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { marked } from 'marked';
import { downloadAsWord } from '../utils/documentUtils';
import '../styles/markdown.css';

const ResponseModal = ({ show, handleClose, message, diagramName = 'response' }) => {
  const [htmlContent, setHtmlContent] = useState('');

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

    // Première passe : convertir le markdown en HTML
    let processedContent = marked(content);

    // Deuxième passe : extraire et convertir les tables des blocs de code
    processedContent = processedContent.replace(
      /<pre><code class="language-markdown">([\s\S]*?)<\/code><\/pre>/g,
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
        <Modal.Title>CrewAI Process Response</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
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
