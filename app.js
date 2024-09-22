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
console.log('Resposta da API de pesquisa:', JSON.stringify(resultado, null, 2));


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

        const pdfPath = path.resolve(__dirname, 'bulas', `${nomeMedicamento}.pdf`);
        const dir = path.resolve(__dirname, 'bulas');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFileSync(pdfPath, bulaPdf);
        console.log(`PDF da bula salvo em: ${pdfPath}`);
        return res.json({ mensagem: `PDF da bula salvo com sucesso em: ${pdfPath}` });
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
