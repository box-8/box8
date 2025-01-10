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
  try {
    const lines = tableContent.trim().split('\n');
    if (lines.length < 3) return null;

    // Vérifier si toutes les lignes commencent par | et se terminent par |
    if (!lines.every(line => line.trim().startsWith('|') && line.trim().endsWith('|'))) {
      return null;
    }

    // Extraire l'en-tête
    const headerCells = lines[0]
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());

    // Vérifier si l'en-tête est valide
    if (headerCells.length === 0) return null;

    // Vérifier si la ligne de séparation est valide
    const separatorLine = lines[1].trim();
    if (!separatorLine.match(/^\|[-:\|\s]+\|$/)) return null;

    // Extraire les lignes de données
    const rows = lines.slice(2).map(line => {
      const cells = line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim());
      
      // Vérifier si la ligne a le même nombre de colonnes que l'en-tête
      return cells.length === headerCells.length ? cells : null;
    }).filter(row => row !== null);

    // Retourner null si aucune ligne de données valide
    return rows.length > 0 ? { headerCells, rows } : null;
  } catch (error) {
    console.error('Erreur lors du parsing de la table:', error);
    return null;
  }
};

const createTableFromMarkdown = (tableContent) => {
  const parsedTable = parseMarkdownTable(tableContent);
  if (!parsedTable) return null;

  const { headerCells, rows } = parsedTable;
  
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
        const table = createTableFromMarkdown(currentTable.join('\n'));
        if (table) {
          children.push(table);
          // Ajouter un espace après la table
          children.push(new Paragraph({ spacing: { after: 200 } }));
        }
        currentTable = [];
        isInTable = false;
      }

      // Traitement normal pour les autres éléments
      if (!isInTable && line.trim()) {
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
      const table = createTableFromMarkdown(currentTable.join('\n'));
      if (table) {
        children.push(table);
        children.push(new Paragraph({ spacing: { after: 200 } }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${filename}.docx`);
  } catch (error) {
    console.error('Error creating Word document:', error);
    throw new Error(`Erreur lors de la création du document Word : ${error.message}`);
  }
};
