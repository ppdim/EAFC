// Храним статистику по турнирам
const stats = {
  rivals: { wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0 },
  qualification: { wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0 },
  weekend_league: { wins: 0, losses: 0, draws: 0, goalsScored: 0, goalsConceded: 0 },
};

// Храним историю матчей
const matchHistory = [];

const form = document.getElementById('match-form');
const statsDiv = document.getElementById('stats');
const penaltyInput = document.getElementById('penalty-score');

// Показать/скрыть поле пенальти в зависимости от турнира
document.getElementById('tournament').addEventListener('change', (e) => {
  const tournament = e.target.value;
  if (tournament === 'qualification' || tournament === 'weekend_league') {
    penaltyInput.style.display = 'block';
  } else {
    penaltyInput.style.display = 'none';
  }
});

// Функция для обновления статистики по каждому турниру
function updateStats(tournament, homeGoals, awayGoals, penaltyWinner = null, isAdding = true) {
  const tournamentStats = stats[tournament];
  const modifier = isAdding ? 1 : -1;

  if (homeGoals > awayGoals || penaltyWinner === 'home') {
    tournamentStats.wins += modifier;
  } else if (homeGoals < awayGoals || penaltyWinner === 'away') {
    tournamentStats.losses += modifier;
  } else if (tournament === 'rivals') {
    // Ничьи возможны только в Rivals
    tournamentStats.draws += modifier;
  }

  tournamentStats.goalsScored += homeGoals * modifier;
  tournamentStats.goalsConceded += awayGoals * modifier;
}

// Функция для подсчёта общей статистики
function getTotalStats() {
  let totalWins = 0, totalLosses = 0, totalDraws = 0, totalGoalsScored = 0, totalGoalsConceded = 0;

  for (let tournament in stats) {
    totalWins += stats[tournament].wins;
    totalLosses += stats[tournament].losses;
    totalDraws += stats[tournament].draws;
    totalGoalsScored += stats[tournament].goalsScored;
    totalGoalsConceded += stats[tournament].goalsConceded;
  }

  return {
    totalWins,
    totalLosses,
    totalDraws,
    totalGoalsScored,
    totalGoalsConceded,
  };
}

// Функция для отображения статистики
function displayStats() {
  statsDiv.innerHTML = `
    <h2>Statistics</h2>
    ${Object.entries(stats).map(([tournament, data]) => `
      <h3>${tournament.charAt(0).toUpperCase() + tournament.slice(1)}</h3>
      <p>Wins: ${data.wins}</p>
      <p>Losses: ${data.losses}</p>
      ${tournament === 'rivals' ? `<p>Draws: ${data.draws}</p>` : ''}
      <p>Goals Scored: ${data.goalsScored}</p>
      <p>Goals Conceded: ${data.goalsConceded}</p>
    `).join('')}

    <h3>Total Statistics (All Tournaments)</h3>
    <p>Wins: ${getTotalStats().totalWins}</p>
    <p>Losses: ${getTotalStats().totalLosses}</p>
    <p>Draws: ${getTotalStats().totalDraws}</p>
    <p>Goals Scored: ${getTotalStats().totalGoalsScored}</p>
    <p>Goals Conceded: ${getTotalStats().totalGoalsConceded}</p>
  `;
}

// Обработка формы
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const tournament = document.getElementById('tournament').value;
  const score = document.getElementById('score').value;

  // Проверяем формат счёта
  const scoreRegex = /^\d+:\d+$/;
  if (!scoreRegex.test(score)) {
    alert('Invalid score format. Please enter in the format X:Y (e.g., 2:1).');
    return;
  }

  const [homeGoals, awayGoals] = score.split(':').map(Number);
  let penaltyWinner = null;

  // Если выбраны Qualification или Weekend League, учитываем пенальти
  if (tournament === 'qualification' || tournament === 'weekend_league') {
    const penaltyScore = document.getElementById('penalty').value;

    if (homeGoals === awayGoals) {
      // Проверяем формат пенальти
      if (!scoreRegex.test(penaltyScore)) {
        alert('Invalid penalty score format. Please enter in the format X:Y (e.g., 3:2).');
        return;
      }

      const [penaltyHome, penaltyAway] = penaltyScore.split(':').map(Number);
      penaltyWinner = penaltyHome > penaltyAway ? 'home' : 'away';
    }
  }

  // Добавляем матч в историю
  matchHistory.push({ tournament, homeGoals, awayGoals, penaltyWinner });

  // Обновляем статистику
  updateStats(tournament, homeGoals, awayGoals, penaltyWinner);

  // Отображаем обновленную статистику
  displayStats();

  // Очищаем поля ввода
  document.getElementById('score').value = '';
  if (penaltyInput.style.display === 'block') {
    document.getElementById('penalty').value = '';
  }
});

// Обработка удаления последнего матча
document.getElementById('delete-last').addEventListener('click', () => {
  if (matchHistory.length === 0) {
    alert('No matches to delete.');
    return;
  }

  // Удаляем последний матч
  const lastMatch = matchHistory.pop();

  // Обновляем статистику с учётом удаления
  updateStats(lastMatch.tournament, lastMatch.homeGoals, lastMatch.awayGoals, lastMatch.penaltyWinner, false);

  // Отображаем обновлённую статистику
  displayStats();
});

// Инициализируем отображение статистики
displayStats();
