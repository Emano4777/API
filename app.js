const express = require('express');
const fs = require('fs');
const path = require('path');
const { pesquisar, getPdf } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para pesquisar o medicamento e salvar o PDF no diretório temporário
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

        // Define o caminho para salvar o PDF temporariamente
        const pdfPath = path.resolve('/tmp', `${nomeMedicamento}.pdf`);
        fs.writeFileSync(pdfPath, bulaPdf);
        console.log(`PDF da bula salvo em: ${pdfPath}`);
        
        // Retorna o caminho para download do PDF
        return res.json({ mensagem: `PDF da bula salvo com sucesso`, pdfUrl: `/api/baixar_pdf?nome=${nomeMedicamento}` });
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

  // Verifica se o arquivo existe no diretório temporário
  if (!fs.existsSync(pdfPath)) {
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
