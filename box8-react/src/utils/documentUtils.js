import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const downloadAsWord = async (markdownContent, filename = 'response') => {
  try {
    // Split content into lines and process each line
    const lines = markdownContent.split('\n');
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: lines.map(line => {
          // Remove any HTML tags that might be present
          line = line.replace(/<[^>]*>/g, '');
          
          // Handle different types of content
          if (line.startsWith('# ')) {
            return new Paragraph({
              children: [new TextRun({
                text: line.replace('# ', ''),
                size: 32,
                bold: true
              })]
            });
          } else if (line.startsWith('## ')) {
            return new Paragraph({
              children: [new TextRun({
                text: line.replace('## ', ''),
                size: 28,
                bold: true
              })]
            });
          } else if (line.startsWith('### ')) {
            return new Paragraph({
              children: [new TextRun({
                text: line.replace('### ', ''),
                size: 26,
                bold: true
              })]
            });
          } else if (line.startsWith('- ')) {
            return new Paragraph({
              children: [new TextRun({
                text: line,
                size: 24
              })],
              bullet: {
                level: 0
              }
            });
          } else {
            return new Paragraph({
              children: [new TextRun({
                text: line || ' ', // Empty line if no content
                size: 24
              })]
            });
          }
        })
      }]
    });

    // Generate and save the document using blob
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${filename}.docx`);
    });
  } catch (error) {
    console.error('Error creating Word document:', error);
  }
};
