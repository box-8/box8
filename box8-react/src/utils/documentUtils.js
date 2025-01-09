import { saveAs } from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle,
  WidthType,
  AlignmentType
} from 'docx';

const parseMarkdownTable = (tableContent) => {
  const lines = tableContent.trim().split('\n');
  if (lines.length < 3) return null;

  // Extraire l'en-tête
  const headerCells = lines[0]
    .split('|')
    .filter(cell => cell.trim())
    .map(cell => cell.trim());

  // Extraire les lignes de données
  const rows = lines.slice(2).map(line => 
    line
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim())
  );

  return { headerCells, rows };
};

const createTableFromMarkdown = (tableContent) => {
  const { headerCells, rows } = parseMarkdownTable(tableContent);
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [
      // En-tête
      new TableRow({
        children: headerCells.map(text => 
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text, bold: true })],
              alignment: AlignmentType.CENTER
            })],
            shading: {
              fill: "F2F2F2",
            },
          })
        ),
      }),
      // Lignes de données
      ...rows.map(rowCells => 
        new TableRow({
          children: rowCells.map(text => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text })],
                alignment: AlignmentType.LEFT
              })]
            })
          ),
        })
      ),
    ],
  });
};

export const downloadAsWord = async (markdownContent, filename = 'response') => {
  try {
    const children = [];
    const lines = markdownContent.split('\n');
    let currentTable = [];
    let isInTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/<[^>]*>/g, '');

      // Détection de table
      if (line.trim().startsWith('|')) {
        isInTable = true;
        currentTable.push(line);
        continue;
      } else if (isInTable && currentTable.length > 0) {
        // Fin de la table
        children.push(createTableFromMarkdown(currentTable.join('\n')));
        currentTable = [];
        isInTable = false;
      }

      // Traitement normal pour les autres éléments
      if (!isInTable) {
        if (line.startsWith('# ')) {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line.replace('# ', ''),
              size: 32,
              bold: true
            })],
            spacing: { before: 200, after: 200 }
          }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line.replace('## ', ''),
              size: 28,
              bold: true
            })],
            spacing: { before: 150, after: 150 }
          }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line.replace('### ', ''),
              size: 26,
              bold: true
            })],
            spacing: { before: 100, after: 100 }
          }));
        } else if (line.startsWith('- ')) {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line.replace('- ', ''),
              size: 24
            })],
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 }
          }));
        } else if (line.startsWith('---') || line.startsWith('***')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: '' })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" } },
            spacing: { before: 150, after: 150 }
          }));
        } else if (line.trim() !== '') {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line,
              size: 24
            })],
            spacing: { before: 80, after: 80 }
          }));
        } else {
          // Ligne vide
          children.push(new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { before: 80, after: 80 }
          }));
        }
      }
    }

    // Gérer la dernière table si elle existe
    if (currentTable.length > 0) {
      children.push(createTableFromMarkdown(currentTable.join('\n')));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    // Generate and save the document
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${filename}.docx`);
    });
  } catch (error) {
    console.error('Error creating Word document:', error);
  }
};
