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
  macaverde: 0,
  melancia: 0,
  banana: 0,
  manga: 0
};

let plantsData = {
  trigo: { price: 20, sellPrice: 35, growTime: 10, imageUrl: 'https://png.pngtree.com/png-clipart/20220124/original/pngtree-cartoon-golden-plump-wheat-ears-png-image_7182394.png' },
  milho: { price: 40, sellPrice: 80, growTime: 20, imageUrl: 'https://png.pngtree.com/png-vector/20240831/ourmid/pngtree-corn-design-png-image_13694493.png' },
  framboesa: { price: 200, sellPrice: 450, growTime: 60, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvBHBJUkbjpNLu0mHT4Cav6w8cUe9-1YGncg&s' },
  morango: { price: 1000, sellPrice: 2500, growTime: 180, imageUrl: 'https://png.pngtree.com/png-vector/20231114/ourmid/pngtree-strawberry-background-diet-strawberries-png-image_10471262.png' },
  maca: { price: 2500, sellPrice: 6000, growTime: 300, imageUrl: 'https://png.pngtree.com/png-vector/20240801/ourmid/pngtree-red-apple-with-leaf---fresh-fruit-clipart-illustration-png-image_13331189.png' },
  macaverde: { price: 12000, sellPrice: 50000, growTime: 720, imageUrl: 'https://png.pngtree.com/png-clipart/20230930/original/pngtree-big-green-apple-png-image_13022349.png' },
  melancia: { price: 28000, sellPrice: 200000, growTime: 1440, imageUrl: 'https://png.pngtree.com/png-clipart/20240925/original/pngtree-whole-watermelon-fruit-png-image_16089036.png'},
  banana:   { price:100,    sellPrice:210,    growTime:52,  imageUrl: 'http://png.pngtree.com/png-clipart/20210530/original/pngtree-banana-vitamin-fruit-diet-png-image_6343208.png' },
  manga:    { price:1000,   sellPrice:2200,   growTime:160,  imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/047/665/062/small_2x/mango-image-transparent-background-png.png' },
};

let plantPositions = {}; // Armazena a posição das plantas
let plants = []; // Lista de plantas (posições delas)
let usedBail = false; // Marca se o seguro fiança já foi usado
let thieves = []; // Lista de ladrões ativos
let thiefSpawnInterval = 10 * 60 * 1000; // 10 minutos em milissegundos
let maxThieves = 12; // Máximo de ladrões simultâneos
let thiefReward = 280; // Moedas ganhas ao clicar em um ladrão
// Recupera o total de adubos salvo (ou 0 se não houver)
let adubo = parseInt(localStorage.getItem('adubo')) || 0;
let aduboAtivo = false;      // Flag que indica se o efeito do adubo está ativo
let aduboTimer = null;       // Guardará o temporizador do efeito
let aduboActivationTime = 0; // Para registrar o instante de ativação
let aduboProgressInterval = null;
let modClickCount = 0;
const modClickThreshold = 5;
let macaverdePlantCount = 0;
// Nível de redução de tempo (% de redução no tempo de crescimento)
// 0 = 50% (base), 1 = 60%, 2 = 70%, 3 = 80%
let aduboReductionLevel = 0;

// Nível de duração do adubo (em minutos)
// 0 = 5, 1 = 6, 2 = 7, 3 = 9, 4 = 10, 5 = 12
let aduboDurationLevel = 0;

// percentuais de redução (fator multiplicativo)
const reductionFactors = [
  0.50,  // base
  0.40,  // nível 1 (60% redução)
  0.30,  // nível 2 (70% redução)
  0.20   // nível 3 (80% redução)
];

// durações em milissegundos para cada nível
const durationValues = [
  5 * 60 * 1000,   // base: 5 min
  6 * 60 * 1000,   // nível 1: 6 min
  7 * 60 * 1000,   // nível 2: 7 min
  9 * 60 * 1000,   // nível 3: 9 min
  10 * 60 * 1000,  // nível 4: 10 min
  12 * 60 * 1000   // nível 5: 12 min
];

// custos de cada nível
const reductionCosts = [1000, 10000, 100000];
const durationCosts  = [2000, 4000, 10000, 50000, 120000];

const basePrice = 35; // ajuste esse valor conforme a lógica do jogo

const seedPrices = {
    trigo: 20,
    milho: 40,
    framboesa: 200,
    morango: 1000,
    maca: 2500,
    macaverde: 12000,
    melancia: 28000,
    banana: 100,
    manga: 1000
  };
  
  // Valores de venda das plantas
  const plantValues = {
    trigo: 35,
    milho: 80,
    framboesa: 450,
    morango: 2500,
    maca: 6000,
    macaverde: 50000,
    melancia: 200000,
    banana: 210,
    manga: 2200
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
  document.getElementById('upgrades').style.display = 'block';


  initializeField();
  updateInventory();
  checkAdubo();
  renderReductionUpgradeButton();
  renderDurationUpgradeButton();
}

function updateAduboDisplay() {
  document.getElementById('aduboCount').innerText = `Você tem ${adubo} adubo${adubo !== 1 ? 's' : ''}`;
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

(function() {
  let alertShown = false;

  function checkOrientation() {
    if (window.innerHeight > window.innerWidth && !alertShown) {
      alert("Para uma melhor experiência, utilize o jogo no modo paisagem (horizontal).");
      alertShown = true;
    }
  }

  window.addEventListener("load", checkOrientation);
  window.addEventListener("resize", checkOrientation);
})();


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

function buyAduboReductionUpgrade() {
  const next = aduboReductionLevel + 1;
  if (next >= reductionFactors.length) return; // já no nível máximo

  const cost = reductionCosts[next - 1];
  if (coins < cost) {
    alert('Você não tem moedas suficientes para esse upgrade de redução!');
    return;
  }

  coins -= cost;
  updateCoinsDisplay();
  aduboReductionLevel = next;

  const fator = reductionFactors[next]; // Ex: 0.6 (60% do tempo)
const crescimentoMaisRapido = Math.round((1 - fator) * 100);
alert(`Upgrade de redução de tempo adquirido! Nível ${next} — as plantas agora crescem ${crescimentoMaisRapido}% mais rápido!`);


  // Atualiza exibição de botões
  renderReductionUpgradeButton();
}


function buyAduboDurationUpgrade() {
  const next = aduboDurationLevel + 1;
  if (next >= durationValues.length) return; // já no nível máximo
  const cost = durationCosts[next - 1];
  if (coins < cost) {
    alert('Você não tem moedas suficientes para esse upgrade de duração!');
    return;
  }
  coins -= cost;
  updateCoinsDisplay();
  aduboDurationLevel = next;
  alert(`Upgrade de duração de adubo adquirido! Nível ${next} (${durationValues[next] / 60000} min)`);

  // Atualiza exibição de botões
  renderDurationUpgradeButton();
}

function renderReductionUpgradeButton() {
  // Exibe a mensagem de bloqueio se a Maçã Verde não foi plantada
  if (macaverdePlantCount === 0) {
    document.getElementById('reduction-locked-msg').style.display = 'block';
    return;
  } else {
    document.getElementById('reduction-locked-msg').style.display = 'none';
  }

  // Agora, adicionamos o botão de upgrade ou uma mensagem caso tenha chegado ao máximo
  const container = document.getElementById('reduction-upgrade-container');
  const next = aduboReductionLevel + 1;
  
  if (next >= reductionFactors.length) {
    container.innerHTML = '<p>Redução no máximo</p>';
  } else {
    const cost = reductionCosts[next - 1];
    container.innerHTML = `
      <button onclick="buyAduboReductionUpgrade()">
        Upgrade Redução de Tempo Nível ${next} (custa ${cost} moedas)
      </button>
    `;
  }
}

function renderDurationUpgradeButton() {
  // Verifica se a Maçã Verde foi plantada, caso contrário, não permite renderizar o botão
  if (macaverdePlantCount === 0) {
    document.getElementById('duration-upgrade-container').innerHTML = '<p>Plante uma Maçã Verde para desbloquear este upgrade!</p>';
    return;
  }

  // Renderiza o botão de upgrade de duração de adubo
  const container = document.getElementById('duration-upgrade-container');
  const next = aduboDurationLevel + 1;

  if (next >= durationValues.length) {
    container.innerHTML = '<p>Duração no máximo</p>';
  } else {
    const cost = durationCosts[next - 1];
    const minutes = durationValues[next] / 60000;
    container.innerHTML = `
      <button onclick="buyAduboDurationUpgrade()">
        Upgrade Duração Adubo Nível ${next} (${minutes} min) – custa ${cost} moedas
      </button>
    `;
  }
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
  document.getElementById('melancia-count').innerText = inventory.melancia;
  document.getElementById('manga-count').innerText  = inventory.manga;
  document.getElementById('banana-count').innerText = inventory.banana;
}

function plantSeed(lotIndex) {
  let fieldContainer = document.getElementById('field');
  let lots = fieldContainer.children;
  let lot = lots[lotIndex];


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

let plantType = prompt('Escolha a planta (trigo, milho, framboesa, morango, maca, macaverde, melancia, banana, manga):');
plantType = plantType?.toLowerCase();

if (!plantsData[plantType]) {
  alert('Planta inválida!');
  return;
}

    // Nova regra: se for melancia, verificar highscore e plantios de macaverde
  if (plantType === 'melancia') {
    // Verifica se o recorde é pelo menos 300 mil
    if (parseInt(highscore) < 300000) {
      alert('Você precisa ter um recorde de pelo menos 300 mil moedas para plantar melancia!');
      return;
    }
    // Verifica se já plantou macaverde pelo menos 5 vezes
    if (macaverdePlantCount < 5) {
      alert('Você precisa plantar macã verde pelo menos 5 vezes para desbloquear a melancia!');
      return;
    }
  }

  if (inventory[plantType] === 0) {
    alert('Você não tem sementes dessa planta!');
    return;
  }

  inventory[plantType]--;
  updateInventory();
  field[lotIndex].plant = plantType;
  field[lotIndex].grown = false; 

    // Bônus especial: chance de ganhar adubo ao plantar manga
  if (plantType === 'manga' && Math.random() < 0.30) {
    adubo++; 
    localStorage.setItem('adubo', adubo);
    updateAduboDisplay();
    alert('Sua manga generosa produziu 1 adubo extra!');
  }

if (plantType === 'macaverde') {
  // Se for o primeiro plantio, libera a área de upgrades
  if (macaverdePlantCount === 0) {
    document.getElementById('upgrades').style.display = 'block';
    alert("Você desbloqueou os upgrades de adubo! Olhe na parte inferior da tela.");
  }

  // Incrementa o contador
  macaverdePlantCount++;
  console.log(`Maçã Verde plantada ${macaverdePlantCount} vez(es).`);

  // Atualiza os botões de upgrade imediatamente
  renderReductionUpgradeButton();
  renderDurationUpgradeButton();
}

  
  lot.classList.add('planted'); 

  // Tempo de crescimento padrão
  let tempoCrescimento = plantsData[plantType].growTime;
  // Se o adubo estiver ativo, reduzir o tempo em 50%
if (aduboAtivo) {
  tempoCrescimento *= reductionFactors[aduboReductionLevel];
}
  
field[lotIndex].growTimeout = setTimeout(() => {
  // Verifica se a planta ainda está lá antes de crescer
  const currentPlant = field[lotIndex].plant;
  if (!currentPlant || field[lotIndex].grown) return;

  field[lotIndex].grown = true;

  const plantImg = document.createElement('img');
  plantImg.src = plantsData[plantType].imageUrl;
  plantImg.style.position = 'absolute';
  plantImg.style.width = '50px';
  plantImg.style.height = '50px';
  plantImg.style.top = '5px';
  plantImg.style.left = '5px';
  plantImg.classList.add("plant");
  plantImg.setAttribute('data-type', plantType);
  plantImg.setAttribute('data-lot', lotIndex);

  lot.appendChild(plantImg);

  field[lotIndex].growTimeout = null; // limpa a referência após uso
}, tempoCrescimento * 1000);
}



function sellPlant(lotIndex) {
  const plant = field[lotIndex].plant;

  let basePrice = plantsData[plant].sellPrice;

  let bonus = getCoinBonus();
  let finalPrice = basePrice * (1 + bonus);  // Aumenta o preço da venda com o bônus

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

  // Cancela o timeout de crescimento, se ainda estiver ativo
if (field[lotIndex].growTimeout) {
  clearTimeout(field[lotIndex].growTimeout);
  field[lotIndex].growTimeout = null;
}


  // Remove a planta após a venda
  field[lotIndex].plant = null; // Reseta a planta no campo
  field[lotIndex].timer = null; // Limpa o temporizador da planta
  field[lotIndex].grown = false; // Reseta o status de "pronta"

  console.log(`Você vendeu um ${plant} por ${finalPrice.toFixed(2)} moedas com ${hiredSecurityCount} seguranças contratados.`);
  alert(`Você vendeu uma planta de ${plant} por ${plantValue} moedas.`);

  // Remove a classe de "pronta para vender" e desativa o clique
  let lot = document.getElementById('field').children[lotIndex];
  lot.innerHTML = ''; // Limpa o conteúdo (imagem) do lote
  lot.classList.remove('planted'); // Remove a classe que indica que o lote foi plantado
  lot.classList.remove('ready-to-sell'); // Remove a classe indicando que está pronto para ser colhido



  return finalPrice;  // Retorna o valor final da venda
}


function useAdubo() {
  if (adubo <= 0) {
    alert('Você não tem adubo suficiente!');
    return;
  }
  if (aduboAtivo) {
    alert('O adubo já está ativo!');
    return;
  }
  adubo--; // Consome 1 adubo
  localStorage.setItem('adubo', adubo);
  updateAduboDisplay();

  aduboAtivo = true;
  aduboActivationTime = Date.now();  
  const durationMs = durationValues[aduboDurationLevel];
  // Aqui você inverte para mostrar 60% mais rápido no lugar de 40%
  alert(`Adubo ativado! Duração: ${durationMs/60000} min; redução: ${(100 - reductionFactors[aduboReductionLevel] * 100).toFixed(0)}%`);

  document.getElementById('aduboTimerContainer').style.display = 'block';
  document.getElementById('aduboTimerBar').style.width = '100%';
  aduboProgressInterval = setInterval(() => updateAduboTimerBar(durationMs), 100);

  aduboTimer = setTimeout(() => {
    aduboAtivo = false;
    clearInterval(aduboProgressInterval);
    document.getElementById('aduboTimerContainer').style.display = 'none';
    alert('O efeito do adubo expirou!');
  }, durationMs);
}



function resetGame() {
    coins = 20;
    usedBail = false;
    planted = {};
    plantPositions = {};
    thieves = [];
    initGame(); // Re-inicia o jogo com as variáveis resetadas
  }

function updateAduboTimerBar(totalDuration) {
  const elapsed = Date.now() - aduboActivationTime;
  const percent = Math.max(0, 100 - (elapsed / totalDuration * 100));
  document.getElementById('aduboTimerBar').style.width = percent + '%';
}

function checkAdubo() {
  if (adubo > 0 && !aduboAtivo) {  // Se houver adubo e não estiver ativo
    document.getElementById("aduboButton").style.display = "block";  // Exibe o botão de adubo
  } else {
    document.getElementById("aduboButton").style.display = "none";  // Esconde o botão caso contrário
  }
}

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  // Função para mover os ladrões
function moveThieves() {
  // Remove do array os ladrões que já tiveram seu elemento removido
  thieves = thieves.filter(thief => thief.element !== null && typeof thief.element !== 'undefined');

  thieves.forEach(thief => {
    // Busca todos os elementos de planta atualmente no campo
    const allPlants = Array.from(document.querySelectorAll('.plant'));
    let closestPlant = null;
    let minDistance = Infinity;
    
    // Percorre cada planta para achar a mais próxima
    allPlants.forEach(plant => {
      const rect = plant.getBoundingClientRect();
      // Usamos a posição do canto superior esquerdo; você pode aprimorar para usar o centro da imagem
      const plantX = rect.left;
      const plantY = rect.top;
      const d = distance(thief.x, thief.y, plantX, plantY);
      if (d < minDistance) {
        minDistance = d;
        closestPlant = plant;
      }
    });
    
    // Se encontrou uma planta, move o ladrão em direção a ela
    if (closestPlant) {
      const rect = closestPlant.getBoundingClientRect();
      const targetX = rect.left;
      const targetY = rect.top;
      
      // Atualiza a posição do ladrão de forma gradual
      thief.x += (targetX - thief.x) * 0.1;
      thief.y += (targetY - thief.y) * 0.1;
      
      // Verifica se o elemento ainda existe antes de atualizar a posição
      if (thief.element) {
        thief.element.style.left = `${thief.x}px`;
        thief.element.style.top = `${thief.y}px`;
      }
      
      // Se o ladrão estiver muito próximo da planta, realiza o roubo
      if (distance(thief.x, thief.y, targetX, targetY) < 5) {
        onPlantStolen(closestPlant);
        // Remove o ladrão do array e do DOM
        thieves = thieves.filter(t => t !== thief);
        if (thief.element) thief.element.remove();
      }
    }
  });
}


  
  // Função para lidar com o roubo de uma planta
function onPlantStolen(plantElement) {
  // Obtém o índice do lote a partir do atributo data-lot
  const lotIndex = parseInt(plantElement.getAttribute('data-lot'));
  
  // Se não conseguir recuperar o índice, aborta
  if (isNaN(lotIndex)) {
    console.log('Erro: Não foi possível identificar o lote da planta.');
    return;
  }
  
  // Recupera o tipo da planta a partir do atributo
const plantType = plantElement.getAttribute('data-type');
if (plantType !== 'milho' && plantType !== 'trigo' && plantType !== 'banana') {
  const seedCost = seedPrices[plantType];
  const refund = seedCost * 0.10; // 10% de reembolso
  updateCoins(refund);
  alert(`Você perdeu uma planta de ${plantType}, mas recebeu ${refund} moedas de reembolso.`);
} else {
  alert(`Os ladrões ignoraram sua planta de ${plantType}.`);
}

  
  // Atualiza o estado do lote: remove a planta e limpa o DOM
  field[lotIndex].plant = null;
  field[lotIndex].grown = false;
  let lot = document.getElementById('field').children[lotIndex];
  if (lot) {
    lot.innerHTML = ''; // Remove o conteúdo (imagem da planta)
    lot.classList.remove('planted');
  }
}



function spawnThieves() {
  // Verifica se ainda cabe mais ladrões
  if (thieves.length >= maxThieves) {
    return;
  }
  
  // Obtém o elemento do campo e suas dimensões
  const fieldEl = document.getElementById('field');
  const fieldWidth = fieldEl.offsetWidth;
  
  // Posiciona o ladrão no topo (y = 0) com X aleatório
  const initialY = 0;
  const initialX = Math.random() * (fieldWidth - 30); // 30px para não ultrapassar a borda
  
  let thief = {
    x: initialX,
    y: initialY,
    element: null
  };
  
  // Cria o elemento visual do ladrão
  const thiefEl = document.createElement('div');
  thiefEl.classList.add('thief');
  thiefEl.style.position = 'absolute';
  thiefEl.style.left = `${initialX}px`;
  thiefEl.style.top = `${initialY}px`;
  
  // Ao clicar no ladrão, concede a recompensa e remove-o
  thiefEl.addEventListener('click', function() {
    updateCoins(thiefReward);
    alert(`Você recebeu ${thiefReward} moedas por clicar no ladrão!`);
    thiefEl.remove();
    thieves = thieves.filter(t => t !== thief);
  });
  
  // Associa o elemento com o objeto ladrão e adiciona-o ao campo
  thief.element = thiefEl;
  fieldEl.appendChild(thiefEl);
  thieves.push(thief);
  
  // Intervalo para o ladrão tentar roubar uma planta a cada 10 segundos
  const stealingInterval = setInterval(() => {
    // Caso o ladrão já tenha sido removido, interrompe o intervalo
    if (!thieves.includes(thief) || !document.body.contains(thief.element)) {
      clearInterval(stealingInterval);
      return;
    }
    
    // Seleciona todas as plantas que não sejam "trigo" ou "milho"
    const allPlants = Array.from(document.querySelectorAll('.plant'));
    const targetablePlants = allPlants.filter(p => {
      const type = p.getAttribute('data-type');
      return type !== 'trigo' && type !== 'milho' && type !== 'banana';
    });
    
    if (targetablePlants.length > 0) {
      // Escolhe aleatoriamente uma planta dentre as válidas
      const plantToSteal = targetablePlants[Math.floor(Math.random() * targetablePlants.length)];
      onPlantStolen(plantToSteal);
    }
  }, 10000); // a cada 10 segundos
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
const securityRange = 2000; // Distância em pixels em que os seguranças podem atacar
const securityReward = 280; // Recompensa por ladrão atingido

let securityList = []; // Lista de seguranças


// Adiciona o BrasilBall (segurança) ao campo de segurança
function createSecurity() {
  const security = document.createElement('div');
  security.classList.add('security');
  security.style.position = 'absolute';
  // configure posição conforme quiser
  security.style.left = '10px';
  security.style.top = '10px';

  const img = document.createElement('img');
  img.src = ''; // URL da imagem
  img.alt = 'brasil';
  security.appendChild(img);

  document.getElementById('securityField').appendChild(security);
  securityList.push(security);         // ← adiciona aqui

  resetAllSecurityIntervals();
  updateSecurityDisplay();

  // === Nova lógica de ataque ===
  const attackInterval = setInterval(() => {
    // seleciona todos os ladrões na página, independente de container
    const thieves = document.querySelectorAll('.thief');
    thieves.forEach(thief => {
      if (isInRange(security, thief)) {
        eliminateThief(thief);
      }
    });
  }, 1000);

  // opcional: guarde o intervalo para limpar depois
  security.attackInterval = attackInterval;
}

function resetAllSecurityIntervals() {
  const n = securityList.length;
  const [captures, delay] = securityParams(n);

  securityList.forEach(secEl => {
    // 1) limpa qualquer intervalo antigo
    if (secEl.attackInterval) clearInterval(secEl.attackInterval);

    // 2) agenda novo intervalo com os parâmetros certos
    secEl.attackInterval = setInterval(() => {
      // seleciona todos os ladrões atuais na página
      const thievesEls = Array.from(document.querySelectorAll('.thief'));

      if (delay === 0) {
        // captura todos instantaneamente e encerra este interval
        thievesEls.forEach(eliminateThief);
        clearInterval(secEl.attackInterval);
        return;
      }

      // captura até `captures` primeiros ladrões
      thievesEls.slice(0, captures).forEach(eliminateThief);
    }, delay);
  });
}


// Parâmetros [quantidade de capturas, delay em ms] para cada número de seguranças
function securityParams(n) {
  switch (n) {
    case 1: return [1, 8000];
    case 2: return [2, 6000];
    case 3: return [3, 4000];
    case 4: return [4, 2000];
    default: return [Infinity, 0];  // 5 ou mais → instantâneo
  }
}

function isInRange(secEl, thiefEl) {
  const secRect   = secEl.getBoundingClientRect();
  const thiefRect = thiefEl.getBoundingClientRect();
  const dx = (secRect.left + secRect.width/2) - (thiefRect.left + thiefRect.width/2);
  const dy = (secRect.top  + secRect.height/2) - (thiefRect.top  + thiefRect.height/2);
  const distance = Math.sqrt(dx*dx + dy*dy);
  const range = 2000; // por exemplo, 2000px de alcance
  return distance <= range;
}

function eliminateThief(thiefEl) {
  // 1) Limpa qualquer timer/movimento do ladrão
  if (thiefEl.moveInterval) clearInterval(thiefEl.moveInterval);

  // 2) Remove o ladrão do DOM
  thiefEl.remove();

  // 3) Chama a recompensa e alerta
  onThiefShot(thiefEl);
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

  // 1) Paga pela segurança
  coins -= securityCost;
  updateCoinsDisplay();

  // 2) Incrementa o contador e atualiza o display
  securityCount++;
  updateSecurityDisplay();

  // 3) Cria o elemento de segurança **e** já o adiciona a securityList
  createSecurity();

  // 4) Reconfigura TODOS os intervals de ataque com as novas regras
  resetAllSecurityIntervals();
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

function scheduleDropCoinsForSecurity() {
  // Intervalo normal (1 minuto e 35 segundos)
  const normalInterval = dropInterval; // ou 95000, se dropInterval estiver definido assim
  
  // Se houver 5 seguranças, o intervalo diminui 30% (ou seja, 70% do normal)
  const adjustedInterval = (securityCount === 5) ? normalInterval * 0.7 : normalInterval;
  
  // Chama a função que dá o drop nas moedas
  dropCoinsForSecurity();

  // Agenda a próxima chamada após o intervalo ajustado
  setTimeout(scheduleDropCoinsForSecurity, adjustedInterval);
}

scheduleDropCoinsForSecurity();

// Intervalo de 1 minuto e 35 segundos para dropar moedas
//setInterval(dropCoinsForSecurity, dropInterval);

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

document.getElementById("modGear").addEventListener("click", function() {
  modClickCount++;
  if (modClickCount >= modClickThreshold) {
    openModMenu();
    modClickCount = 0;  // reseta o contador após abrir o mod menu
  }
});

function openModMenu() {
  // Exibe o mod menu
  document.getElementById("modMenu").style.display = "block";
  // Exibe alerta e aciona a punição: 5 ladrões spawnados instantaneamente
  alert("Você ativou o mod menu! Suas consequências: 5 ladrões foram spawnados instantaneamente.");
  for (let i = 0; i < 5; i++) {
    spawnThieves();
  }
}

document.getElementById("btnCloseMod").addEventListener("click", function() {
  document.getElementById("modMenu").style.display = "none";
});

document.getElementById("btnAddAdubo").addEventListener("click", function() {
  adubo++;
  localStorage.setItem("adubo", adubo);
  updateAduboDisplay();
});

document.getElementById("btnInstaGrow").addEventListener("click", function() {
  const fieldContainer = document.getElementById('field');
  field.forEach((lot, index) => {
    if (lot.plant && !lot.grown) {
      // cancela o timer original
      if (lot.growTimeout) {
        clearTimeout(lot.growTimeout);
        lot.growTimeout = null;
      }
      // marca como crescida
      lot.grown = true;
      // redesenha no DOM
      const lotElement = fieldContainer.children[index];
      lotElement.innerHTML = '';
      const plantImg = document.createElement('img');
      plantImg.src = plantsData[lot.plant].imageUrl;
      plantImg.classList.add('plant');
      plantImg.setAttribute('data-type', lot.plant);
      plantImg.setAttribute('data-lot', index);
      plantImg.style.cssText = 'position:absolute;width:50px;height:50px;top:5px;left:5px';
      lotElement.appendChild(plantImg);
    }
  });
});

document.getElementById("btnAddCoins").addEventListener("click", function() {
  updateCoins(40000);
});

document.querySelectorAll('.seedModBtn').forEach(btn => {
  btn.addEventListener('click', function() {
    const seedType = btn.getAttribute('data-seed');
    inventory[seedType]++;
    updateInventory();
    alert(`Você recebeu uma semente de ${seedType}.`);
  });
});



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

document.getElementById('aduboButton').onclick = function() {
  useAdubo();
};
  
  // Chama a inicialização do jogo quando a página carrega
  window.onload = initGame;

// Atualiza a exibição logo na inicialização do jogo:
updateAduboDisplay();

setInterval(() => {
  updateHighscore();
}, 10000);

setInterval(() => {
    spawnThieves();
}, 600000);
