setTimeout(function(){ $('#loading').hide(); }, 1000);
let _sData = JSON.parse(window.localStorage.getItem("sData"));
if(_sData != null) {
  loadData(_sData);
}

$('#saveBtn').click(() => {
    let res = JSON.parse($('#sData').val());

    window.localStorage.setItem("sData", JSON.stringify(res));
    $('#addData').modal('hide');

    window.location.reload();
    $('#loading').show();
});

function loadData(res) {
  res.battles.forEach((item, i) => {
    $('#detail').append(`
      <table class="table table-dark fink">
        <tbody>
          <tr class="brow">
            <td class="axie-img rbt"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[0]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[0]}/axie/axie-full-transparent.png"/></a></td>
            <td class="axie-img rbt"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[1]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[1]}/axie/axie-full-transparent.png"/></a></td>
            <td class="axie-img rbt"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[2]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[2]}/axie/axie-full-transparent.png"/></a></td>
          </tr>
          <tr>
            <td>${item.game_ended.split('T')[0]}</td>
            <td>VS</td>
            <td><a href="https://cdn.axieinfinity.com/game/deeplink.html?f=rpl&q=${item.battle_uuid}" target="_blank" class="text-primary">${item.eloAndItem[0].result_type}</a></td>
          </tr>
          <tr class="brow">
            <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[0]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[0]}/axie/axie-full-transparent.png"/></a></td>
            <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[1]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[1]}/axie/axie-full-transparent.png"/></a></td>
            <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[2]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[2]}/axie/axie-full-transparent.png"/></a></td>
          </tr>
        </tbody>
      </table>`);
  });
}
