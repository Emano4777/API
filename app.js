const express = require('express');
const { pesquisar, getPdfUrl } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para pesquisar o medicamento e gerar o link para download do PDF
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
        // Gera o link para o PDF sem precisar salvar localmente
        const pdfUrl = `https://consultas.anvisa.gov.br/api/consulta/medicamentos/arquivo/bula/parecer/${idBulaPacienteProtegido}/?Authorization=Guest`;
        
        return res.json({
          medicamento: medicamento.nomeProduto,
          pdfUrl: pdfUrl, // URL gerada para download
          mensagem: `Clique no botão abaixo para baixar a bula`
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
