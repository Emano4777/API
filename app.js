const express = require('express');
const { pesquisar } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para pesquisar o medicamento e obter o ID da bula
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
        // Retorna apenas o ID da bula
        return res.json({
          medicamento: medicamento.nomeProduto,
          idBulaPacienteProtegido,
          mensagem: `ID da bula obtido com sucesso. Use o ID para baixar o PDF.`
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

module.exports = app;
