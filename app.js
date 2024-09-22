const { pesquisar, getPdf } = require('./utils');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
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

        const pdfPath = path.resolve('/tmp', `${nomeMedicamento}.pdf`);
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
};
