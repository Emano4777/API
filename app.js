const express = require('express');
const fs = require('fs');
const path = require('path');
const { pesquisar, getPdf } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

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
        console.log(`ID da bula do paciente: ${idBulaPacienteProtegido}`);

        const bulaPdf = await getPdf(idBulaPacienteProtegido);

        if (!bulaPdf || bulaPdf.length === 0) {
          console.error("Erro: O PDF retornado está vazio ou corrompido.");
          return res.status(500).json({ erro: "Falha ao baixar o PDF. O arquivo está vazio." });
        }

        // Configura os headers para baixar o PDF diretamente
        res.setHeader('Content-Disposition', `attachment; filename=${nomeMedicamento}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(bulaPdf); // Envia o PDF diretamente na resposta
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

// Rota para baixar o PDF já salvo no diretório temporário
app.get('/api/baixar_pdf', (req, res) => {
  const nomeMedicamento = req.query.nome;
  const pdfPath = path.resolve('/tmp', `${nomeMedicamento}.pdf`);
  
  console.log(`Tentando acessar o PDF no caminho: ${pdfPath}`);

  // Verifica se o arquivo existe no diretório temporário
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF não encontrado: ${pdfPath}`);
    return res.status(404).json({ erro: 'PDF não encontrado. Talvez o arquivo ainda não tenha sido gerado.' });
  }

  // Configura os headers para baixar o PDF
  res.setHeader('Content-Disposition', `attachment; filename=${nomeMedicamento}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  
  // Faz o streaming do arquivo PDF
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
