setTimeout(function(){ $('#loading').hide(); }, 2000);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if(urlParams.get('ronin')) {
  $.ajax({
    url: 'https://tracking.skymavis.com/battle-history?type=pvp&player_id='+urlParams.get('ronin'),
    success: function(res) {

      res.battles.forEach((item, i) => {
        console.log(item);
        $('#detail').append(`<tr>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[0]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[0]}/axie/axie-full-transparent.png"/></a></td>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[1]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[1]}/axie/axie-full-transparent.png"/></a></td>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.first_team_fighters[2]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.first_team_fighters[2]}/axie/axie-full-transparent.png"/></a></td>
          <td>VS</td>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[0]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[0]}/axie/axie-full-transparent.png"/></a></td>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[1]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[1]}/axie/axie-full-transparent.png"/></a></td>
          <td class="axie-img"><a href="https://marketplace.axieinfinity.com/axie/${item.second_team_fighters[2]}" target="_blank"><img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${item.second_team_fighters[2]}/axie/axie-full-transparent.png"/></a></td>
          <td><a href="https://cdn.axieinfinity.com/game/deeplink.html?f=rpl&q=${item.battle_uuid}" target="_blank" class="text-primary">${item.eloAndItem[0].result_type}</a></td>
          <tr>`);
      });

      $('#loading').hide();
    }
  });
}
