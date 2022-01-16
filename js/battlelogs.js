setTimeout(function(){ $('#loading').hide(); }, 1000);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

loadData(urlParams.get('player'));

$('#saveBtn').click(() => {
    let res = JSON.parse($('#sData').val());

    window.localStorage.setItem("sData", JSON.stringify(res));
    $('#addData').modal('hide');

    window.location.reload();
    $('#loading').show();
});

function loadData(player) {
  $.ajax({
    url: 'https://game-api.axie.technology/logs/pvp/'+player,
    // cache: false,
    success: function(res) {
      res.battles.forEach((item, i) => {
        result = item.winner == player ? 'Win' : 'Lose';
        textColor = result == 'Win' ? 'text-success' : 'text-danger';
        mmr1 = '';
        mmr2 = '';

        if(item.first_client_id == player) {
            axie1 = item.first_team_fighters[0];
            axie2 = item.first_team_fighters[1];
            axie3 = item.first_team_fighters[2];
            axie4 = item.second_team_fighters[0];
            axie5 = item.second_team_fighters[1];
            axie6 = item.second_team_fighters[2];
            opRon = item.second_client_id;
            if((item.eloAndItem) && item.eloAndItem[0]) {
                mmr1 = '<span class="asmall m6">'+ item.eloAndItem[0].new_elo +' MMR</span>';
            }
            if((item.eloAndItem) && item.eloAndItem[1]) {
                mmr2 = '<span class="asmall m6">'+ item.eloAndItem[1].new_elo +' MMR</span>';
            }
        } else {
            axie1 = item.second_team_fighters[0];
            axie2 = item.second_team_fighters[1];
            axie3 = item.second_team_fighters[2];
            axie4 = item.first_team_fighters[0];
            axie5 = item.first_team_fighters[1];
            axie6 = item.first_team_fighters[2];
            opRon = item.first_client_id;
            if((item.eloAndItem) && item.eloAndItem[1]) {
                mmr1 = '<span class="asmall m6">'+ item.eloAndItem[1].new_elo +' MMR</span>';
            }
            if((item.eloAndItem) && item.eloAndItem[0]) {
                mmr2 = '<span class="asmall m6">'+ item.eloAndItem[0].new_elo +' MMR</span>';
            }
        }
        battle_uuid = item.battle_uuid;
        d = new Date(item.game_ended);
        date = d.toLocaleDateString("en-US");
        dTime = d.toLocaleTimeString('en-US', { hour12: true });

        $('#detail').append(`
          <div class="container abattle">
            <div class="row">
                <div class="col col-4 axie-img rbt">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie1}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie1}/axie/axie-full-transparent.png">
                    </a>
                </div>
                <div class="col col-4 axie-img rbt">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie2}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie2}/axie/axie-full-transparent.png">
                    </a>
                </div>
                <div class="col col-4 axie-img rbt">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie3}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie3}/axie/axie-full-transparent.png">
                    </a>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 opponent">
                    ${mmr1}
                </div>
                <div class="col col-4 opponent">
                    <img src="img/pvp-small.png"/><a class="pl-2" href="./?player=${opRon}"></a>
                </div>
                <div class="col col-4 opponent">
                    ${mmr2}
                </div>
            </div>
            <div class="row">
                <div class="col col-4 axie-img">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie4}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie4}/axie/axie-full-transparent.png">
                    </a>
                </div>
                <div class="col col-4 axie-img">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie5}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie5}/axie/axie-full-transparent.png">
                    </a>
                </div>
                <div class="col col-4 axie-img">
                    <a href="https://marketplace.axieinfinity.com/axie/${axie6}" target="_blank">
                        <img src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${axie6}/axie/axie-full-transparent.png">
                    </a>
                </div>
            </div>
            <div class="row">
                <hr class="sep">
                <div class="col col-4"><span class="asmall">${date}</span><span class="asmall">${dTime}</span></div>
                <div class="col col-4 ${textColor}"><span class="vsub">${result}</span></div>
                <div class="col col-4">
                    <a class="awatch" href="https://cdn.axieinfinity.com/game/deeplink.html?f=rpl&amp;q=${battle_uuid}" target="_blank" class="text-primary">
                        <div>
                            <span class="asmall">Watch</span>
                            <span class="asmall">in app </span>
                        </div>
                        <div>
                            <span class="bi bi-arrow-up-right-square-fill cgray"></span>
                        </div>
                    </a>
                </div>
            </div>
        </div>`);
      });
    },
    error: function(e) {

    }
  });

}
