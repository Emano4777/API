const express = require('express');
const { pesquisar, getPdfUrl } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para pesquisar o medicamento e obter o link da bula
app.get('/api/pesquisar_bula', async (req, res) => {
  const nomeMedicamento = req.query.nome;
  if (!nomeMedicamento) {
    return res.status(400).json({ erro: 'Nome do medicamento é obrigatório' });
  }

  try {
    console.log(`Buscando medicamento: ${nomeMedicamento}`);
    const resultado = await pesquisar(nomeMedicamento);

    if (resultado && resultado.content && resultado.content.length > 0) {
      const medicamento = resultado.content[0];
      const idBulaPacienteProtegido = medicamento.idBulaPacienteProtegido;

      if (idBulaPacienteProtegido) {
        // Retorna imediatamente o link para o PDF, sem esperar
        const pdfUrl = `/api/baixar_pdf?id=${idBulaPacienteProtegido}`;
        return res.json({
          medicamento: medicamento.nomeProduto,
          bulaUrl: pdfUrl,
          mensagem: `Clique no link para baixar o PDF da bula: ${pdfUrl}`
        });
      } else {
        return res.status(404).json({ erro: 'Bula não encontrada para o medicamento' });
      }
    } else {
      return res.status(404).json({ erro: 'Medicamento não encontrado' });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// Rota para baixar o PDF
app.get('/api/baixar_pdf', async (req, res) => {
  const idBulaPacienteProtegido = req.query.id;
  if (!idBulaPacienteProtegido) {
    return res.status(400).json({ erro: 'ID da bula é obrigatório' });
  }

  try {
    const { url, erro } = await getPdfUrl(idBulaPacienteProtegido);
    if (erro) {
      // O PDF não está pronto, retorna um erro 202
      return res.status(202).json({ mensagem: erro, link: url });
    }
    // Redireciona para o link do PDF
    return res.redirect(url);
  } catch (err) {
    console.error('Erro ao tentar obter o PDF:', err);
    return res.status(500).json({ erro: 'Erro ao tentar obter o PDF da bula' });
  }
});

module.exports = app;
