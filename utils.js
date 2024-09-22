const fetch = require('node-fetch');
const https = require('https');

// Função para gerar um User-Agent aleatório
function randomUseragent() {
  let arr = [
    'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
    'Mozilla/5.0 (X11; Linux i686; rv:16.0) Gecko/20100101 Firefox/16.0',
    'Opera/9.80 (X11; Linux i686) Presto/2.12.388 Version/12.16',
    'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10'
  ];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Headers padrão
function headers() {
  return {
    "accept": "application/json, text/plain, */*",
    "authorization": "Guest",
    "user-agent": randomUseragent(),
  };
}

// Função para pesquisar medicamentos
async function pesquisar(nomeProduto, pagina = 1) {
  const response = await fetch(`https://consultas.anvisa.gov.br/api/consulta/bulario?count=1&filter[nomeProduto]=${encodeURIComponent(nomeProduto)}&page=${pagina}`, {
    method: "GET",
    agent: new https.Agent({ rejectUnauthorized: false }),
    headers: headers()
  });

  const medicines = await response.json();
  return medicines;
}

// Função para obter o PDF da bula
async function getPdf(idBulaP_Protegido) {
  const response = await fetch(`https://consultas.anvisa.gov.br/api/consulta/medicamentos/arquivo/bula/parecer/${idBulaP_Protegido}/?Authorization=Guest`, {
    method: 'GET',
    agent: new https.Agent({ rejectUnauthorized: false }),
    headers: headers()
  });

  if (response.status !== 200) {
    throw new Error('Erro ao baixar o PDF. Status: ' + response.status);
  }

  return await response.buffer();
}

module.exports = {
  pesquisar,
  getPdf
};
