const express = require('express');
const { getPdfUrl } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para baixar o PDF usando o ID da bula
app.get('/api/baixar_pdf', async (req, res) => {
  const idBulaPacienteProtegido = req.query.id;
  if (!idBulaPacienteProtegido) {
    return res.status(400).json({ erro: 'ID da bula é obrigatório' });
  }

  try {
    console.log(`Buscando PDF da bula com ID: ${idBulaPacienteProtegido}`);
    const pdfUrl = await getPdfUrl(idBulaPacienteProtegido);
    if (!pdfUrl) {
      return res.status(404).json({ erro: 'PDF não encontrado ou indisponível' });
    }

    // Redireciona para o link do PDF para o cliente baixar
    return res.redirect(pdfUrl.url);
  } catch (err) {
    console.error('Erro ao tentar obter o PDF:', err);
    return res.status(500).json({ erro: 'Erro ao tentar baixar o PDF da bula' });
  }
});

module.exports = app;
