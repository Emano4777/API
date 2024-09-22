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
        // Em vez de baixar o PDF, retornar a URL
        const pdfUrl = `https://consultas.anvisa.gov.br/api/consulta/medicamentos/arquivo/bula/parecer/${idBulaPacienteProtegido}/?Authorization=Guest`;
        return res.json({
          medicamento: medicamento.nomeProduto,
          bulaUrl: pdfUrl,
          mensagem: `A bula está disponível no seguinte link: ${pdfUrl}`
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
