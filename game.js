let coins = 20;
let highscore = localStorage.getItem('highscore') || 0;
let playerName = '';
let field = [];
let inventory = {
  trigo: 0,
  milho: 0,
  framboesa: 0,
  morango: 0,
  maca: 0,
  macaverde: 0
};

let plantsData = {
  trigo: { price: 20, sellPrice: 35, growTime: 10, imageUrl: 'https://png.pngtree.com/png-clipart/20220124/original/pngtree-cartoon-golden-plump-wheat-ears-png-image_7182394.png' },
  milho: { price: 40, sellPrice: 80, growTime: 30, imageUrl: 'https://png.pngtree.com/png-vector/20240831/ourmid/pngtree-corn-design-png-image_13694493.png' },
  framboesa: { price: 200, sellPrice: 450, growTime: 60, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvBHBJUkbjpNLu0mHT4Cav6w8cUe9-1YGncg&s' },
  morango: { price: 1000, sellPrice: 2500, growTime: 180, imageUrl: 'https://png.pngtree.com/png-vector/20231114/ourmid/pngtree-strawberry-background-diet-strawberries-png-image_10471262.png' },
  maca: { price: 2500, sellPrice: 6000, growTime: 300, imageUrl: 'https://png.pngtree.com/png-vector/20240801/ourmid/pngtree-red-apple-with-leaf---fresh-fruit-clipart-illustration-png-image_13331189.png' },
  macaverde: { price: 12000, sellPrice: 50000, growTime: 720, imageUrl: 'https://png.pngtree.com/png-clipart/20230930/original/pngtree-big-green-apple-png-image_13022349.png' },
};

let plantPositions = {}; // Armazena a posição das plantas
let plants = []; // Lista de plantas (posições delas)
let usedBail = false; // Marca se o seguro fiança já foi usado
let thieves = []; // Lista de ladrões ativos
let thiefSpawnInterval = 10 * 60 * 1000; // 10 minutos em milissegundos
let maxThieves = 12; // Máximo de ladrões simultâneos
let thiefReward = 280; // Moedas ganhas ao clicar em um ladrão

const seedPrices = {
    trigo: 20,
    milho: 40,
    framboesa: 200,
    morango: 1000,
    maca: 2500,
    macaVerde: 12000
  };
  
  // Valores de venda das plantas
  const plantValues = {
    trigo: 35,
    milho: 80,
    framboesa: 450,
    morango: 2500,
    maca: 6000,
    macaVerde: 50000
  };


function startGame() {
  playerName = document.getElementById('playerName').value;
  if (!playerName) {
    alert('Por favor, digite seu nome!');
    return;
  }

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  document.getElementById('playerNameDisplay').innerText = playerName;
  document.getElementById('highscore').innerText = highscore;

  initializeField();
  updateInventory();
}

function initializeField() {
  let fieldContainer = document.getElementById('field');
  for (let i = 0; i < 20; i++) {
    let lot = document.createElement('div');
    lot.addEventListener('click', () => plantSeed(i));
    field.push({ plant: null, timer: null });
    fieldContainer.appendChild(lot);
  }
}

function buySeed(plantType) {
  if (coins < plantsData[plantType].price) {
    alert('Você não tem moedas suficientes!');
    return;
  }

  coins -= plantsData[plantType].price;
  inventory[plantType]++;
  updateInventory();
  document.getElementById('coins').innerText = coins;
}


function updateCoins(amount) {
    // Incrementa (ou decrementa) as moedas do jogador
    coins += amount;
  
    // Atualiza o texto das moedas na interface
    document.getElementById('coins').innerText = coins;
  
    // Verifica se o jogador atingiu 1 milhão de moedas
    if (coins >= 1000000) {
      alert('Parabéns! Você zerou o jogo com 1 milhão de moedas! 🎉');
    }

    if (coins <= 19 && !usedBail) {
        giveBail();
      }
    
      // Se o jogador ficar com menos de 20 moedas e o seguro fiança já foi usado
      if (coins <= 19 && usedBail) {
        alert('Game Over! Você ficou sem moedas após usar o seguro fiança!');
        // Aqui você pode reiniciar o jogo ou finalizar, dependendo de como deseja lidar com o game over
        resetGame();
      }
  }
  
  function giveBail() {
    usedBail = true;
    coins += 500; // O jogador recebe 500 moedas de seguro fiança
    alert('Você usou o seguro fiança de 500 moedas para se reerguer!');
  }
  
  
  
function updateInventory() {
  document.getElementById('trigo-count').innerText = inventory.trigo;
  document.getElementById('milho-count').innerText = inventory.milho;
  document.getElementById('framboesa-count').innerText = inventory.framboesa;
  document.getElementById('morango-count').innerText = inventory.morango;
  document.getElementById('maca-count').innerText = inventory.maca;
  document.getElementById('macaverde-count').innerText = inventory.macaverde;
}

function plantSeed(lotIndex) {
  let lot = document.getElementById('field').children[lotIndex];

  // Verifica se já existe uma planta no lote
  if (field[lotIndex].plant) {
      // Se a planta estiver pronta para ser vendida, permite a coleta
      if (field[lotIndex].grown) {
          sellPlant(lotIndex); // Chama a função de venda
      } else {
          alert('Esta planta ainda não está pronta para ser colhida!');
      }
      return; // Impede que o código continue se já tiver planta no lote
  }

  // Se o lote não tiver planta, pergunta ao jogador qual planta ele deseja plantar
  let plantType = prompt('Escolha a planta (trigo, milho, framboesa, morango, maca, macaverde):');
  if (!plantsData[plantType]) {
      alert('Planta inválida!');
      return;
  }

  if (inventory[plantType] === 0) {
      alert('Você não tem sementes dessa planta!');
      return;
  }

  // Deduz as sementes e atualiza o inventário
  inventory[plantType]--;
  updateInventory();

  // Planta a semente no lote
  field[lotIndex].plant = plantType;
  lot.classList.add('planted'); // Marca o lote como "plantado"
  
  // Define o tempo para a planta crescer
  let timer = setTimeout(() => {
      lot.innerHTML = `<img src="${plantsData[plantType].imageUrl}" />`;
      field[lotIndex].plant = plantType; // Mantém o tipo da planta
      field[lotIndex].grown = true; // Marca como pronto para colher
  }, plantsData[plantType].growTime * 1000);

  // Define o timer e o estado de crescimento da planta
  field[lotIndex].timer = timer;
  field[lotIndex].grown = false; // A planta não está pronta ainda
}

function sellPlant(lotIndex) {
  const plant = field[lotIndex].plant;

  if (!plant || !field[lotIndex].grown) {
      alert('Não há planta pronta para vender neste lote.');
      return;
  }

  if (field[lotIndex].stolen) {
      alert('Esta planta foi roubada e não pode ser vendida.');
      return;
  }

  const plantValue = plantValues[plant];
  updateCoins(plantValue); // Adiciona o valor da planta às moedas

  // Remove a planta após a venda
  field[lotIndex].plant = null; // Reseta a planta no campo
  field[lotIndex].timer = null; // Limpa o temporizador da planta
  field[lotIndex].grown = false; // Reseta o status de "pronta"
  
  alert(`Você vendeu uma planta de ${plant} por ${plantValue} moedas.`);

  // Remove a classe de "pronta para vender" e desativa o clique
  let lot = document.getElementById('field').children[lotIndex];
  lot.innerHTML = ''; // Limpa o conteúdo (imagem) do lote
  lot.classList.remove('planted'); // Remove a classe que indica que o lote foi plantado
  lot.classList.remove('ready-to-sell'); // Remove a classe indicando que está pronto para ser colhido
}





function resetGame() {
    coins = 20;
    usedBail = false;
    planted = {};
    plantPositions = {};
    thieves = [];
    initGame(); // Re-inicia o jogo com as variáveis resetadas
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  // Função para mover os ladrões
  function moveThieves() {
    thieves.forEach(thief => {
      let closestPlant = null;
      let minDistance = Infinity;
      let plantToSteal = null;
  
      // Verifica as plantas e escolhe a mais próxima ou mais valiosa
      for (const [plantType, position] of Object.entries(plantPositions)) {
        // Só considera plantas que estão plantadas e são "prontas para roubo"
        if (position.grown && !position.stolen && field[position.x] && field[position.y]) {
          let dist = distance(thief.x, thief.y, position.x, position.y);
          
          // Prioriza a planta mais cara ou mais próxima
          if (dist < minDistance) {
            minDistance = dist;
            closestPlant = position;
            plantToSteal = plantType;
          }
        }
      }
  
      // Move o ladrão em direção à planta escolhida
      if (closestPlant) {
        thief.x += (closestPlant.x - thief.x) * 0.1; // Movimento gradual em direção à planta
        thief.y += (closestPlant.y - thief.y) * 0.1;
  
        // Se o ladrão chega na planta
        if (distance(thief.x, thief.y, closestPlant.x, closestPlant.y) < 5) {
          onPlantStolen(plantToSteal);
          // Remove o ladrão após roubo
          thieves = thieves.filter(t => t !== thief);
        }
      }
    });
  }
  
  // Função para lidar com o roubo de uma planta
  function onPlantStolen(plantType) {
    // Verifica se a planta existe
    if (!plantPositions[plantType]) {
      console.log('Erro: A planta não existe.');
      return; // Se a planta não existe, não faz nada
    }
  
    // Verifica se a planta roubada não é milho ou trigo
    if (plantType !== 'milho' && plantType !== 'trigo') {
      const seedCost = seedPrices[plantType];
      const refund = seedCost * 0.10; // 10% de reembolso
      updateCoins(refund);
      alert(`Você perdeu uma planta de ${plantType}, mas recebeu ${refund} moedas de reembolso.`);
    } else {
      alert('Os ladrões ignoraram suas plantas de milho/trigo.');
    }
  
    // Marca a planta como roubada
    if (plantPositions[plantType]) {
      plantPositions[plantType].stolen = true;
    }
  }
  
function updateHighscore() {
  if (coins > highscore) {
    highscore = coins;
    localStorage.setItem('highscore', highscore);
  }
}

let securityCount = 0; // Contagem de seguranças (Brasilballs)
const maxSecurity = 5; // Limite de seguranças
const securityCost = 1200; // Custo por segurança
const securityRange = 60; // Distância em pixels em que os seguranças podem atacar
const securityReward = 280; // Recompensa por ladrão atingido

let securityList = []; // Lista de seguranças


// Adiciona o BrasilBall (segurança) ao campo de segurança
function createSecurity() {
  if (securityCount < maxSecurity) {
    const security = document.createElement('div');
    security.classList.add('security');
    security.style.position = 'absolute';

    // Imagem do BrasilBall
    const img = document.createElement('img');
    img.src = '';
    img.alt = 'brasil';
    security.appendChild(img);

    // Adiciona ao container de seguranças
    document.getElementById('securityField').appendChild(security);

    // Muda a contagem de seguranças no display
    updateSecurityDisplay();
  }
}


// Função de comprar segurança
document.getElementById('securityButton').onclick = function () {
  if (coins < securityCost) {
    alert('Você não tem moedas suficientes para contratar um segurança!');
    return;
  }

  if (securityCount >= maxSecurity) {
    alert('Você já contratou o número máximo de seguranças!');
    return;
  }

  // Subtrai moedas
  coins -= securityCost;
  securityCount++;

  // Cria o segurança
  createSecurity();

  // Atualiza os displays
  updateCoinsDisplay();
  updateSecurityDisplay();
};


function updateCoinsDisplay() {
  document.getElementById('coins').innerText = coins;
}

// Atualiza o display de seguranças contratados
function updateSecurityDisplay() {
  document.getElementById('securityCount').innerText = `Seguranças contratados: ${securityCount}/${maxSecurity}`;
}

// Função para mover os seguranças e disparar tiros
function moveAndShootSecurity() {
    securityList.forEach(security => {
        if (thieves.length > 0) {
            // Encontrar o ladrão mais próximo
            let closestThief = null;
            let minDistance = Infinity;
            
            thieves.forEach(thief => {
                let distanceToThief = distance(security.x, security.y, thief.x, thief.y);
                if (distanceToThief < minDistance) {
                    minDistance = distanceToThief;
                    closestThief = thief;
                }
            });

            if (closestThief) {
                // Mover o segurança em direção ao ladrão mais próximo
                moveSecurityTowardsThief(security, closestThief);
                // Verifica se o segurança está perto o suficiente do ladrão para atirar
                let distanceToThief = distance(security.x, security.y, closestThief.x, closestThief.y);
                if (distanceToThief <= securityRange) {
                    onThiefShot(closestThief);
                    thieves = thieves.filter(t => t !== closestThief); // Remove o ladrão após ser atingido
                }
            }
        } else {
            // Se não houver ladrões, mover aleatoriamente
            moveSecurityRandomly(security);
        }
    });
}

// Função para mover o segurança em direção ao ladrão
function moveSecurityTowardsThief(security, thief) {
    let angle = Math.atan2(thief.y - security.y, thief.x - security.x);
    security.x += Math.cos(angle) * 2; // Velocidade do movimento
    security.y += Math.sin(angle) * 2;
}

// Função para mover o segurança de forma aleatória
function moveSecurityRandomly(security) {
    const randomDirection = Math.random() * Math.PI * 2; // Direção aleatória
    security.x += Math.cos(randomDirection) * 2; // Velocidade do movimento
    security.y += Math.sin(randomDirection) * 2;

    // Impede que o segurança saia da tela
    if (security.x < 0) security.x = 0;
    if (security.y < 0) security.y = 0;
    if (security.x > window.innerWidth) security.x = window.innerWidth;
    if (security.y > window.innerHeight) security.y = window.innerHeight;
}

// Função chamada quando um ladrão é atingido
function onThiefShot(thief) {
    updateCoins(securityReward); // Ganha 280 moedas
    alert(`Você ganhou 280 moedas por ter atingido um ladrão!`);
}

// Chama a função de movimento e disparo dos seguranças a cada 1 segundo
setInterval(moveAndShootSecurity, 1000);

// Exibe o botão para criar seguranças na interface
function displaySecurityButton() {
    const button = document.createElement('button');
    button.innerText = 'Contratar Segurança (1200 moedas)';
    button.onclick = createSecurity;
    document.body.appendChild(button);

    // Exibe a quantidade de seguranças contratados
    const securityCountDisplay = document.createElement('div');
    securityCountDisplay.id = 'securityCount';
    securityCountDisplay.innerText = `Seguranças contratados: ${securityCount}`;
    document.body.appendChild(securityCountDisplay);
}

// Chama a função para exibir o botão de segurança ao carregar o jogo
window.onload = displaySecurityButton;


function initGame() {
    // Define o valor inicial das moedas na interface
    document.getElementById('coins').innerText = coins;
  
    // Inicia os ladrões (apenas como exemplo)
    thieves.push({ x: 100, y: 100 }); // Posição inicial de um ladrão
    thieves.push({ x: 200, y: 200 }); // Posição inicial de outro ladrão
  
    // Inicia as plantas
    plantPositions['framboesa'] = { x: 300, y: 300, grown: true, stolen: false }; // Exemplo de planta
    plantPositions['morango'] = { x: 500, y: 500, grown: true, stolen: false }; // Exemplo de planta
  
    console.log('Jogo iniciado!');
    setInterval(moveThieves, 1000); // Atualiza o movimento dos ladrões a cada 1 segundo
  }
  
  // Chama a inicialização do jogo quando a página carrega
  window.onload = initGame;

setInterval(() => {
  updateHighscore();
}, 10000);

setInterval(() => {
    spawnThieves();
}, 600000);
