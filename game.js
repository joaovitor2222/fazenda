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
  let fieldContainer = document.getElementById('field');
  let lots = fieldContainer.children; // Pega todos os lotes
  let lot = lots[lotIndex]; // Obtém o lote correto

  if (!lot) {
      console.error(`Erro: Lote ${lotIndex} não encontrado.`);
      return;
  }

  if (field[lotIndex].plant) {
      if (field[lotIndex].grown) {
          sellPlant(lotIndex);
      } else {
          alert('Esta planta ainda não está pronta para ser colhida!');
      }
      return;
  }

  let plantType = prompt('Escolha a planta (trigo, milho, framboesa, morango, maca, macaverde):');
  if (!plantsData[plantType]) {
      alert('Planta inválida!');
      return;
  }

  if (inventory[plantType] === 0) {
      alert('Você não tem sementes dessa planta!');
      return;
  }

  inventory[plantType]--;
  updateInventory();
  field[lotIndex].plant = plantType;
  field[lotIndex].grown = false; 

  // ✅ Agora o lote fica verde quando plantamos
  lot.classList.add('planted'); 

  setTimeout(() => {
    field[lotIndex].grown = true;

    // Depuração para ver qual lote está sendo selecionado
    console.log(`Planta crescendo no lote ${lotIndex}`, lot);

    let plantImg = document.createElement('img');
    plantImg.src = plantsData[plantType].imageUrl;
    plantImg.style.position = 'absolute';
    plantImg.style.width = '50px';
    plantImg.style.height = '50px';
    plantImg.style.top = '5px';
    plantImg.style.left = '5px';

    lot.appendChild(plantImg); // Agora adiciona a imagem no lote correto
}, plantsData[plantType].growTime * 1000);
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

  let bonus = getCoinBonus();
  let finalPrice = basePrice * (1 + bonus);  // Aumenta o preço da venda com o bônus
  console.log(`Você vendeu um ${plantType} por ${finalPrice.toFixed(2)} moedas com ${hiredSecurityCount} seguranças contratados.`);
  return finalPrice;  // Retorna o valor final da venda
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
let hiredSecurityCount = 0;  // Quantidade de seguranças contratados
let securityBaseTime = 5;    // Tempo base que a segurança leva para agir, em segundos
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
// Função para mover os seguranças
function moveAndShootSecurity() {
  securityList.forEach(security => {
      if (thieves.length > 0) {
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

      // Interação com a área das plantas
      field.forEach((lot, index) => {
          let lotElement = document.getElementById('field').children[index];
          let lotX = lotElement.offsetLeft;
          let lotY = lotElement.offsetTop;
          let lotWidth = lotElement.offsetWidth;
          let lotHeight = lotElement.offsetHeight;

          // Verifica se o segurança está dentro da área do lote (invadindo a área da field das plantas)
          if (security.x >= lotX && security.x <= lotX + lotWidth &&
              security.y >= lotY && security.y <= lotY + lotHeight) {
              // Aqui, o segurança está "invadindo" a área do lote, então ele pode interagir com a planta
              if (lot.plant && !lot.stolen) {
                  console.log(`Segurança protegendo o lote ${index}`);
                  lot.stolen = false; // Lógica para o segurança proteger ou coletar a planta
                  highlightLot(lotElement); // Destacar visualmente o lote
                  highlightSecurity(security); // Destacar visualmente o segurança
              }
          } else {
              // Resetar as alterações visuais quando o segurança sair da área
              resetLotVisuals(lotElement);
              resetSecurityVisuals(security);
          }
      });
  });
}

// Função para adicionar destaque ao lote quando invadido
function highlightLot(lotElement) {
  lotElement.style.border = "3px solid red"; // Borda vermelha para indicar interação
  lotElement.style.backgroundColor = "rgba(255, 0, 0, 0.2)"; // Fundo vermelho semitransparente
}

// Função para remover o destaque do lote
function resetLotVisuals(lotElement) {
  lotElement.style.border = "";
  lotElement.style.backgroundColor = "";
}

// Função para adicionar destaque ao segurança
function highlightSecurity(security) {
  let securityElement = document.getElementById(`security-${security.id}`);
  securityElement.style.backgroundColor = "yellow"; // Alerta visual para o segurança
}

function getReducedSecurityTime() {
  let reducedTime = securityBaseTime * (1 - hiredSecurityCount * 0.05);
  return reducedTime > 1 ? reducedTime : 1;  // O tempo não pode ser menor que 1 segundo
}

// Função para calcular o bônus de moedas baseado no número de seguranças contratados
function getCoinBonus() {
  return hiredSecurityCount * 0.05;  // A cada segurança contratada, ganha 5% a mais
}

let coinDropAmount = 50; // Moedas por segurança contratado
let dropInterval = 95000; // Intervalo de 1 minuto e 35 segundos (95.000 milissegundos)

// Função para adicionar moedas por cada segurança contratado a cada 1 minuto e 35 segundos
function dropCoinsForSecurity() {
  const totalCoinsToAdd = securityCount * coinDropAmount; // Calcula o total de moedas a ser adicionado
  if (totalCoinsToAdd > 0) {
    updateCoins(totalCoinsToAdd);  // Atualiza as moedas do jogador
    alert(`Você recebeu ${totalCoinsToAdd} moedas por seus seguranças!`);
  }
}

// Intervalo de 1 minuto e 35 segundos para dropar moedas
setInterval(dropCoinsForSecurity, dropInterval);

// Função para contratar segurança
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

// Função para contratar seguranças
function hireSecurity(count) {
  hiredSecurityCount += count;  // Aumenta o número de seguranças contratados
  console.log(`${count} seguranças contratados. Agora você tem ${hiredSecurityCount} seguranças no total.`);
}

// Exemplo de como reduzir o tempo de ação das seguranças
let reducedTime = getReducedSecurityTime();

// Função para remover o destaque do segurança
function resetSecurityVisuals(security) {
  let securityElement = document.getElementById(`security-${security.id}`);
  securityElement.style.backgroundColor = "";
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

// Função que verifica se a segurança está em um lote
document.addEventListener("DOMContentLoaded", function() {
  const security = document.querySelector('.security');
  const fieldElements = document.querySelectorAll('#field div');

  if (!security || fieldElements.length === 0) {
    console.error("Erro: segurança ou campos não encontrados.");
    return;
  }

  // Função que verifica se a segurança está em um lote
  function checkSecurityInteraction(securityElement, fieldElements) {
    const securityRect = securityElement.getBoundingClientRect(); // Pega as coordenadas da segurança

    // Verifica se a segurança está dentro de um lote
    fieldElements.forEach(field => {
      const fieldRect = field.getBoundingClientRect();

      if (isCollision(securityRect, fieldRect)) {
        console.log('Segurança está no lote!');
        // Aqui você pode adicionar a lógica para o que acontece quando a segurança está em cima de um lote
      }
    });
  }

  // Função que verifica a colisão entre dois elementos
  function isCollision(rect1, rect2) {
    return rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top &&
           rect1.left < rect2.right &&
           rect1.right > rect2.left;
  }

  // Chame a função a cada intervalo para verificar a interação da segurança
  setInterval(() => {
    checkSecurityInteraction(security, fieldElements);
  }, 100);
});


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
